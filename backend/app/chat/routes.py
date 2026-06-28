from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc
from jose import jwt, JWTError

from app.core.config import settings
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.chat import Conversation, Message, MessageType
from app.models.collaboration import Collaboration, CollaborationStatus
from app.chat.schemas import ConversationRead, MessageRead
from app.chat.connection_manager import manager as chat_manager
from app.core import security

from app.activity.service import ActivityService
from app.notifications.service import NotificationService
from app.notifications.schemas import NotificationCreate
from app.notifications.models import NotificationType
import asyncio
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# --- REST ENDPOINTS ---

@router.get("/conversations")
def get_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for the current user's collaborations."""
    # Find collaborations where user is either business or promoter
    # We need to link through their profiles
    collaborations = []
    
    if hasattr(current_user, 'business_profile') and current_user.business_profile:
        collabs = db.query(Collaboration).filter(Collaboration.business_profile_id == current_user.business_profile.id).all()
        collaborations.extend(collabs)
        
    if hasattr(current_user, 'promoter_profile') and current_user.promoter_profile:
        collabs = db.query(Collaboration).filter(Collaboration.promoter_profile_id == current_user.promoter_profile.id).all()
        collaborations.extend(collabs)

    collab_ids = [c.id for c in collaborations]
    
    conversations = db.query(Conversation).filter(Conversation.collaboration_id.in_(collab_ids)).all()
    
    existing_collab_ids = {c.collaboration_id for c in conversations}
    missing_collab_ids = [cid for cid in collab_ids if cid not in existing_collab_ids]
    
    for missing_id in missing_collab_ids:
        new_conv = Conversation(collaboration_id=missing_id)
        db.add(new_conv)
        conversations.append(new_conv)
    
    if missing_collab_ids:
        db.commit()
        for new_conv in conversations:
            if new_conv.id is None:
                db.refresh(new_conv)
    
    result = []
    for conv in conversations:
        # Build participant info
        participants = []
        if conv.collaboration.business_profile and conv.collaboration.business_profile.user:
            bu = conv.collaboration.business_profile.user
            participants.append({
                "id": str(bu.id), 
                "name": bu.username, 
                "avatar": conv.collaboration.business_profile.logo_url or "",
                "role": "BUSINESS"
            })
        if conv.collaboration.promoter_profile and conv.collaboration.promoter_profile.user:
            pu = conv.collaboration.promoter_profile.user
            participants.append({
                "id": str(pu.id), 
                "name": pu.username, 
                "avatar": conv.collaboration.promoter_profile.avatar_url or "",
                "role": "PROMOTER"
            })
            
        last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(desc(Message.created_at)).first()
        unread_count = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.sender_id != current_user.id,
            Message.read_at == None
        ).count()
        
        conv_data = ConversationRead.model_validate(conv).model_dump()
        conv_data["participants"] = participants
        conv_data["unread_count"] = unread_count
        conv_data["last_message"] = MessageRead.model_validate(last_msg).model_dump() if last_msg else None
        
        result.append(conv_data)
        
    return result

@router.get("/collaborations/{collaboration_id}/history")
def get_conversation_history(
    collaboration_id: UUID,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure conversation exists
    conv = db.query(Conversation).filter(Conversation.collaboration_id == collaboration_id).first()
    if not conv:
        # Create it if it doesn't exist
        collab = db.query(Collaboration).filter(Collaboration.id == collaboration_id).first()
        if not collab:
            raise HTTPException(status_code=404, detail="Collaboration not found")
        
        conv = Conversation(collaboration_id=collaboration_id)
        db.add(conv)
        db.commit()
        db.refresh(conv)
        
        # Activity Log
        ActivityService.record(
            db=db,
            actor_id=current_user.id,
            actor_role=current_user.role,
            entity_type="CONVERSATION",
            entity_id=conv.id,
            action="CREATED",
            title="Conversation Started",
            description=f"Conversation started for collaboration {collab.id}"
        )
        
    offset = (page - 1) * limit
    messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(desc(Message.created_at)).offset(offset).limit(limit).all()
    
    total = db.query(Message).filter(Message.conversation_id == conv.id).count()
    has_next = (offset + limit) < total
    
    result_messages = []
    for m in messages:
        m_data = MessageRead.model_validate(m).model_dump()
        sender = db.query(User).filter(User.id == m.sender_id).first()
        if sender:
            if hasattr(sender, 'business_profile') and sender.business_profile and sender.business_profile.logo_url:
                m_data["sender_avatar"] = sender.business_profile.logo_url
            elif hasattr(sender, 'promoter_profile') and sender.promoter_profile and sender.promoter_profile.avatar_url:
                m_data["sender_avatar"] = sender.promoter_profile.avatar_url
        result_messages.append(m_data)
    
    data = {
        "messages": result_messages,
        "next_page": page + 1 if has_next else None
    }
    return data

@router.post("/conversations/{conversation_id}/read")
def mark_read(
    conversation_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update all unread messages in conversation not from current user
    from datetime import datetime, timezone
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.sender_id != current_user.id,
        Message.read_at == None
    ).update({"read_at": datetime.now(timezone.utc)})
    db.commit()
    return {"message": "Conversation marked as read"}


# --- WEBSOCKET ENDPOINT ---

def get_user_from_token(token: str, db: Session) -> Optional[User]:
    try:
        payload = security.decode_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return db.query(User).filter(User.id == UUID(user_id)).first()
    except Exception as e:
        logger.error(f"Error decoding token: {e}")
        return None

@router.websocket("/ws/chat/{conversation_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    conversation_id: UUID, 
    token: str = Query(...), 
    db: Session = Depends(get_db)
):
    user = get_user_from_token(token, db)
    if not user:
        logger.error(f"Chat WS failed: user not found for token {token}")
        print(f"Chat WS failed: user not found for token {token}")
        await websocket.close(code=1008)
        return
        
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        logger.error(f"Chat WS failed: conv not found for {conversation_id}")
        print(f"Chat WS failed: conv not found for {conversation_id}")
        await websocket.close(code=1008)
        return
        
    collab = conv.collaboration
    # Verify participation
    is_participant = False
    if hasattr(user, 'business_profile') and user.business_profile and collab.business_profile_id == user.business_profile.id:
        is_participant = True
    elif hasattr(user, 'promoter_profile') and user.promoter_profile and collab.promoter_profile_id == user.promoter_profile.id:
        is_participant = True
        
    if not is_participant and user.role.value != "ADMIN":
        logger.error(f"Chat WS failed: user {user.id} not participant in collab {collab.id}. BP: {collab.business_profile_id}, PP: {collab.promoter_profile_id}")
        print(f"Chat WS failed: user {user.id} not participant in collab {collab.id}. BP: {collab.business_profile_id}, PP: {collab.promoter_profile_id}")
        await websocket.close(code=1008)
        return
        
    logger.info(f"Chat WS accepted for {conversation_id}")
    await chat_manager.connect(websocket, conversation_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            
            # Allow TEXT messages only if ACTIVE
            if event_type == "MESSAGE":
                if collab.status != CollaborationStatus.ACTIVE:
                    await websocket.send_json({"type": "ERROR", "payload": {"message": "Collaboration is completed, chat is read-only."}})
                    continue
                    
                content = data.get("payload", {}).get("text", "")
                if not content:
                    continue
                    
                msg = Message(
                    conversation_id=conversation_id,
                    sender_id=user.id,
                    message=content,
                    message_type=MessageType.TEXT
                )
                db.add(msg)
                db.commit()
                db.refresh(msg)
                
                sender_avatar = None
                if hasattr(user, 'business_profile') and user.business_profile and user.business_profile.logo_url:
                    sender_avatar = user.business_profile.logo_url
                elif hasattr(user, 'promoter_profile') and user.promoter_profile and user.promoter_profile.avatar_url:
                    sender_avatar = user.promoter_profile.avatar_url
                
                # Activity Log
                ActivityService.record(
                    db=db,
                    actor_id=user.id,
                    actor_role=user.role,
                    entity_type="MESSAGE",
                    entity_id=msg.id,
                    action="SENT",
                    title="Message Sent",
                    description=f"Message sent in conversation {conversation_id}"
                )
                
                # Broadcast
                msg_data = MessageRead.model_validate(msg).model_dump(mode="json")
                msg_data["sender_avatar"] = sender_avatar
                await chat_manager.broadcast({
                    "type": "MESSAGE",
                    "payload": msg_data
                }, conversation_id)
                
                # Notifications: Find the other participant and check if they're connected
                other_user_id = collab.business_profile.user_id if user.id == collab.promoter_profile.user_id else collab.promoter_profile.user_id
                
                is_connected = False
                if conversation_id in chat_manager.active_connections:
                    # We need a way to check if other user is in this active connections.
                    # A robust way is to just generate a notification if we are not tracking user identities in chat_manager.
                    pass 
                
                # We'll just create the notification and let the WS broadcast push it. 
                # If they are reading chat, it will be fetched as read.
                notification_service = NotificationService(db)
                notification_in = NotificationCreate(
                    recipient_id=other_user_id,
                    actor_id=user.id,
                    type=NotificationType.NEW_MESSAGE,
                    title="New Message",
                    message=f"You received a new message from {user.username}",
                    entity_type="chat_message",
                    entity_id=msg.id
                )
                asyncio.create_task(notification_service.create_notification(notification_in))
                
            elif event_type == "TYPING_START":
                await chat_manager.broadcast({
                    "type": "TYPING_START",
                    "payload": {"user_id": str(user.id)}
                }, conversation_id)
                
            elif event_type == "TYPING_STOP":
                await chat_manager.broadcast({
                    "type": "TYPING_STOP",
                    "payload": {"user_id": str(user.id)}
                }, conversation_id)
                
    except WebSocketDisconnect:
        chat_manager.disconnect(websocket, conversation_id)
