# Notification System — End-to-End Completion Design

_Approved: 2026-06-27_

## 1. Goals

- Fix the real-time delivery bug so collaboration notifications arrive instantly via WebSocket.
- Wire up every defined notification type so the enum, backend producers, and frontend UI are in sync.
- Eliminate hardcoded values and inconsistent creation patterns.
- Add the missing notification preferences and delete affordances that were referenced in code but never surfaced to users.

## 2. Fix Critical Delivery Bug

**File:** `backend/app/services/collaboration.py`

Replace all direct `Notification()` ORM instantiation (lines ~236-247, ~263-274, ~454-465, ~487-498) with `NotificationService.create_notification()`.

**Why:** `NotificationService.create_notification()` commits the record to the database AND calls `manager.send_personal_message()` to push the event via WebSocket. Direct ORM instantiation skips the broadcast entirely, leaving the recipient in the dark until the next 60-second REST poll.

**Implementation:** Import `NotificationService` and `NotificationCreate` from `app.notifications.service` / `app.notifications.schemas`. Replace each raw `Notification(...)` construction with a `NotificationCreate(...)` payload passed to the service.

## 3. Implement Missing Notification Creators

All types below are defined in `app/notifications/models.py` (`NotificationType`) and mirrored in `frontend/src/features/notifications/types.ts`, but no code currently produces them.

| Type | Trigger location | File to modify |
|------|-----------------|----------------|
| `INVITATION_RECEIVED` | `invite_promoter` in `services/collaboration.py` | `services/collaboration.py` |
| `INVITATION_ACCEPTED` | `accept_invitation` in `services/collaboration.py` | `services/collaboration.py` |
| `INVITATION_DECLINED` | `reject_invitation` in `services/collaboration.py` | `services/collaboration.py` |
| `REVIEW_RECEIVED` | `create_review` in `services/review.py` | `services/review.py` |
| `COLLABORATION_STARTED` | `invite_promoter` or `accept_invitation` | `services/collaboration.py` |
| `COLLABORATION_COMPLETED` | `complete_collaboration` in `services/collaboration.py` | `services/collaboration.py` |
| `CAMPAIGN_MATCH_READY` | `generate_matches` in `services/matching.py` | `services/matching.py` |

Each creator calls `NotificationService.create_notification(NotificationCreate(...))` with recipient, actor, type, title, message, and optional `entity_type`/`entity_id`.

## 4. Hardcode WS URL Fix

**File:** `frontend/src/features/notifications/websocket.ts`

Replace literal `ws://localhost:8000/ws/notifications?token=` with `import.meta.env.VITE_WS_URL` (fallback to `ws://localhost:8000`). Construct the full WS path by appending `/ws/notifications`.

```ts
const BASE = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
const url = `${BASE}/ws/notifications?token=${token}`;
```

## 5. Add Delete Button to UI

**Files:**
- `frontend/src/components/notifications/NotificationCard.tsx`
- `frontend/src/components/notifications/NotificationBell.tsx`

Import and call `useDeleteNotification()` from `hooks.ts`. Add a `<button>` (trash icon) to `NotificationCard` that triggers the mutation. On success, call `queryClient.invalidateQueries(notificationKeys.all)`.

## 6. Fix Achievement Double Broadcast

**File:** `backend/app/achievements/service.py`

Remove the explicit `ws_manager.send_personal_message(ACHIEVEMENT_UNLOCKED, user.id)` block. `NotificationService.create_notification()` already pushes `NEW_NOTIFICATION`, which the frontend's `useNotificationWebSocket` picks up and routes through the same React Query invalidation path. The `AchievementToast` should observe the notifications or achievements query rather than the special WS event.

## 7. Standardize API Response

**File:** `backend/app/notifications/routes.py`

`get_notifications` currently returns `{"success": True, "notifications": notifications, "total": total, ...}` as a raw `dict`. Wrap it in the standard envelope with a `response_model` to match `app/exceptions/handlers.py` conventions.

## 8. Add NotificationPreferences — Minimal

### Backend

**New file (or reuse):** `app/notifications/preferences.py`

- Model: `NotificationPreference(user_id, type, enabled)` with unique constraint on `(user_id, type)`.
- Migration: create `notification_preferences` table.
- Seed: for each existing user, create rows for every `NotificationType` with `enabled=true`.
- Routes: `GET /api/v1/notifications/preferences`, `PUT /api/v1/notifications/preferences` (replace-all).

### Service Integration

Add an `is_enabled(type: NotificationType, user_id: UUID) -> bool` helper to `NotificationService`. In `NotificationService.create_notification()`, check the preference before persisting. If disabled, skip silently.

### Frontend

In the existing **Settings / Profile** page, add:

```tsx
<NotificationPreferences user={user} />
```

A simple toggle list for each notification type. Fetch `GET /notifications/preferences` on mount. On change, `PUT /notifications/preferences` with the full preference map.

## 9. Add Daily Email Digest — Basic

**New file:** `backend/app/notifications/email_digest.py`

Use the existing async task/celery pattern (if present) or a plain `asyncio.create_task()` fallback to:

1. Query users with unread notifications from the last 24 hours.
2. Group notifications by user.
3. Render a simple HTML email (using `utils/email.py`'s existing template pattern).
4. Send via configured SMTP.

Trigger: called from `NotificationService.create_notification()` only if (a) 24 hours have elapsed since the user's last digest, and (b) the user has `email_enabled` (future extension; initially send to all verified users).

## 10. Add "Load More" to Bell Dropdown

**Files:**
- `frontend/src/components/notifications/NotificationBell.tsx`
- `frontend/src/features/notifications/hooks.ts`
- `frontend/src/features/notifications/api.ts`

Start with `limit=10`. When user clicks **"Show more"**, increment the page refetch param and append results. Store expanded state locally. For now, cap at 50 to avoid runaway pagination.

## 11. Testing & Verification Checklist

- [ ] `ruff` on backend and frontend
- [ ] Each notification type appears in the DB and arrives via WebSocket
- [ ] Offline user sees notification after page reload (REST fallback)
- [ ] Mark-read, mark-all-read, delete flows work end-to-end
- [ ] Dropdown "Show more" paginates correctly
- [ ] Preferences disable a type → no notification created
- [ ] Email digest sends and arrives (SMTP configured)
- [ ] No regression in chat, collaboration, or achievement flows
