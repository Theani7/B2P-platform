# Unified Notification Center

## Overview
The **Unified Notification Center** (PH-2.7) serves as the central hub for alerting users across the Byparsathy platform. Instead of maintaining siloed notification logic across various modules (like chat, reviews, or applications), everything channels through a single, standardized, database-backed engine.

## Architecture

### Database Schema (`notifications`)
- `id`: UUID Primary Key
- `recipient_id`: UUID Foreign Key mapping directly to the target user
- `actor_id`: UUID Foreign Key tracking who initiated the event (nullable for SYSTEM messages)
- `type`: Enum `NotificationType` mapping standard application states
- `title`, `message`: String payloads shown directly in the UI
- `entity_type`, `entity_id`: Allows frontend routing to link back to the originating object (like opening the correct Chat window or Review page).
- `is_read`, `read_at`: Boolean flag and timestamp for tracking state

### REST Endpoints
- `GET /api/v1/notifications`: Paginated list of user notifications, descending by time.
- `GET /api/v1/notifications/unread-count`: Fast aggregation polling endpoint (mostly used as fallback for WebSocket drops).
- `PUT /api/v1/notifications/{id}/read`: Individual toggling.
- `PUT /api/v1/notifications/read-all`: Batch sweep marking.

### WebSocket Push (`ws://localhost:8000/ws/notifications`)
Uses a separate JWT-authenticated `NotificationConnectionManager` handling global user maps. When `NotificationService.create_notification` triggers, it instantly iterates through active connections mapped to `recipient_id` and fires a `NEW_NOTIFICATION` event. The frontend intercepts this using `useNotificationWebSocket` and invalidates React Query's `notificationKeys.all`, causing the UI unread badge and dropdown to instantly snap to the correct state without manual page refreshes.

## Supported Event Types
- `APPLICATION_RECEIVED`, `APPLICATION_ACCEPTED`, `APPLICATION_REJECTED`
- `INVITATION_RECEIVED`, `INVITATION_ACCEPTED`, `INVITATION_DECLINED`
- `NEW_MESSAGE`
- `REVIEW_RECEIVED`
- `COLLABORATION_STARTED`, `COLLABORATION_COMPLETED`
- `CAMPAIGN_MATCH_READY`
- `SYSTEM`

## Chat Integration
Rather than generating thousands of pointless chat notifications for two users actively messaging each other, the Chat Router (`backend/app/chat/routes.py`) fires notifications via `asyncio.create_task()` immediately upon persisting a message. The WebSocket `NotificationConnectionManager` silently fails if the user is disconnected, natively simulating offline notifications without expensive state-tracking algorithms.

## Future Enhancements
- **Email Digest**: Add a background Celery task that queries `is_read == False` records generated over the last 24 hours and dispatches an HTML email.
- **Push API / OneSignal**: Plug into external push engines by extending `NotificationService`.
- **User Settings**: Add a `notification_preferences` table allowing users to suppress specific enum types (like `NEW_MESSAGE` or `CAMPAIGN_MATCH_READY`).
