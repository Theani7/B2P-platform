# Real-Time Collaboration Chat

## Overview
The **Real-Time Collaboration Chat** (PH-2.6) provides an exclusive messaging interface for Businesses and Promoters to communicate once a collaboration has been established. To maintain a professional environment and prevent spam, chat is strictly limited to Active or Completed collaborations, becoming read-only when completed.

## Architecture

### Database Schema
- **`conversations`**: Links a unique `collaboration_id` to a single message stream.
- **`messages`**: Contains individual message records. Supports different `message_type` variants (`TEXT`, `IMAGE`, `SYSTEM`).

### WebSockets Endpoint
`ws://localhost:8000/ws/chat/{conversation_id}?token={JWT_TOKEN}`

Websocket communication uses JSON payloads. 
#### Events Sent from Client:
- **`MESSAGE`**: Sent with payload `{ "text": "Hello world" }`
- **`TYPING_START`**: Broadcasts typing indicators to the other participant.
- **`TYPING_STOP`**: Clears the typing indicator.

#### Events Broadcast from Server:
- **`MESSAGE`**: Fully populated Message model sent to all connected clients.
- **`TYPING_START`**: Includes `{ "user_id": "uuid" }`.
- **`TYPING_STOP`**: Includes `{ "user_id": "uuid" }`.
- **`READ_RECEIPT`**: Emitted when a client successfully calls the REST endpoint `/api/v1/chat/conversations/{id}/read`.

### REST Endpoints
- `GET /api/v1/chat/conversations`: Returns a unified list of all active/completed conversations for the currently authenticated user, enriched with participant details, unread counts, and the most recent message for sidebar preview.
- `GET /api/v1/chat/collaborations/{id}/history`: Paginated history of a specific conversation (infinite scrolling logic).
- `POST /api/v1/chat/conversations/{id}/read`: Marks all unread messages in the conversation (sent by the *other* participant) as read. 

## Business Logic
1. **Chat Lifecycle**: A Conversation is automatically created on the first fetch of `/history` for a given `collaboration_id` if it doesn't already exist.
2. **Read-Only Mode**: If `CollaborationStatus` is `COMPLETED`, the WebSocket server automatically rejects incoming `MESSAGE` payloads, maintaining the chat interface as an archived record.
3. **Authentication**: Users must provide a valid `token` query parameter during the handshake since standard HTTP headers are often restricted in browser WebSocket APIs.
4. **Activity System**:
    - "Conversation Started" event is logged when the record is created.
    - "Message Sent" event is logged for every new message.

## Frontend UI
- Features responsive components (`ChatSidebar`, `ChatWindow`) utilizing `date-fns` for timestamps.
- Implements `useChatWebSocket` custom hook leveraging standard `WebSocket` API and auto-reconnect strategy (3s backoff).
- Infinite message history via `@tanstack/react-query`'s `useInfiniteQuery`.
- Micro-interactions: Framer-motion typing indicators, bouncing dots, and instantaneous UI layout mapping.

## Future Extension Points
- **Attachments/Media**: Enable `IMAGE` message type payloads by integrating the `/upload` API endpoint and sending S3/local URLs via WebSockets.
- **Notifications**: Add a fallback that triggers an email or push notification if a message is sent while the `ConnectionManager` shows the recipient is offline.
- **Message Reactions/Editing**: Add `reaction` JSON fields and enable `PUT /api/v1/chat/messages/{id}`.
