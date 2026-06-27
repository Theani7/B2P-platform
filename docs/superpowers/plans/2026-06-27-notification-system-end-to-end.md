# Notification System End-to-End Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the notification system so all defined types fire, WebSocket delivery works for every notification, preferences are respected, and the UI exposes all backend capabilities.

**Architecture:** Fix the core backend delivery path first (replace raw ORM with NotificationService across all producers), then implement the 7 missing notification creators, close the frontend gaps (hardcoded URL, delete button, load-more), add a notification-preferences subsystem (model + API + frontend toggles + service gate), and add a basic daily email digest for offline users.

**Tech Stack:** FastAPI, SQLAlchemy, React Query, WebSocket, TanStack Query, date-fns, lucide-react.

## Global Constraints

- Backend Python code must use existing `NotificationService` and `NotificationCreate` patterns.
- Frontend must use existing `notificationKeys` from `features/notifications/api.ts`.
- All notification creation must go through `NotificationService.create_notification()` — never instantiate `Notification()` model directly.
- WS URL must come from `import.meta.env.VITE_WS_URL` with fallback.
- Use existing `utils/email.py` patterns for the email digest.
- Follow existing migration naming: `YYYYMMDD_HHMM_notifications.py`.

---

### Task 1: Fix Collaboration Notification Delivery

**Files:**
- Modify: `backend/app/services/collaboration.py`
- Test: manually verify WS push after applying/rejecting

**Interfaces:**
- Consumes: `NotificationService`, `NotificationCreate`
- Produces: `NotificationService.create_notification()` calls in 4 places

- [ ] **Step 1: Add imports at top of collaboration.py**

Add to the import block at the top of `collaboration.py` (around line 15):
```python
from app.notifications.service import NotificationService
from app.notifications.schemas import NotificationCreate
from app.notifications.models import NotificationType
```

- [ ] **Step 2: Replace first direct ORM block (apply_to_campaign, withdrawn re-apply)**

In `apply_to_campaign`, lines 236-248, replace:
```python
            from app.notifications.models import Notification, NotificationType
            business_user_id = campaign.business_profile.user_id
            notification = Notification(
                recipient_id=business_user_id,
                actor_id=user.id,
                type=NotificationType.APPLICATION_RECEIVED,
                title="New application received",
                message=f"{user.username} applied to your campaign '{campaign.title}'",
                entity_type="campaign_application",
                entity_id=existing.id,
            )
            db.add(notification)
            db.commit()
```

With:
```python
            business_user_id = campaign.business_profile.user_id
            notification_service = NotificationService(db)
            notification_create = NotificationCreate(
                recipient_id=business_user_id,
                actor_id=user.id,
                type=NotificationType.APPLICATION_RECEIVED,
                title="New application received",
                message=f"{user.username} applied to your campaign '{campaign.title}'",
                entity_type="campaign_application",
                entity_id=existing.id,
            )
            notification_service.create_notification(notification_create)
```

- [ ] **Step 3: Replace second direct ORM block (apply_to_campaign, new application)**

In `apply_to_campaign`, lines 263-275, replace:
```python
    from app.notifications.models import Notification, NotificationType
    business_user_id = campaign.business_profile.user_id
    notification = Notification(
        recipient_id=business_user_id,
        actor_id=user.id,
        type=NotificationType.APPLICATION_RECEIVED,
        title="New application received",
        message=f"{user.username} applied to your campaign '{campaign.title}'",
        entity_type="campaign_application",
        entity_id=application.id,
    )
    db.add(notification)
    db.commit()
```

With:
```python
    business_user_id = campaign.business_profile.user_id
    notification_service = NotificationService(db)
    notification_create = NotificationCreate(
        recipient_id=business_user_id,
        actor_id=user.id,
        type=NotificationType.APPLICATION_RECEIVED,
        title="New application received",
        message=f"{user.username} applied to your campaign '{campaign.title}'",
        entity_type="campaign_application",
        entity_id=application.id,
    )
    notification_service.create_notification(notification_create)
```

- [ ] **Step 4: Replace third direct ORM block (accept_application)**

In `accept_application`, lines 454-466, replace:
```python
    from app.notifications.models import Notification, NotificationType
    promoter_user_id = application.promoter_profile.user_id
    notification = Notification(
        recipient_id=promoter_user_id,
        actor_id=business.user_id,
        type=NotificationType.APPLICATION_ACCEPTED,
        title="Application accepted",
        message=f"Your application for '{campaign.title}' has been accepted!",
        entity_type="collaboration",
        entity_id=collab.id,
    )
    db.add(notification)
    db.commit()
```

With:
```python
    promoter_user_id = application.promoter_profile.user_id
    notification_service = NotificationService(db)
    notification_create = NotificationCreate(
        recipient_id=promoter_user_id,
        actor_id=business.user_id,
        type=NotificationType.APPLICATION_ACCEPTED,
        title="Application accepted",
        message=f"Your application for '{campaign.title}' has been accepted!",
        entity_type="collaboration",
        entity_id=collab.id,
    )
    notification_service.create_notification(notification_create)
```

- [ ] **Step 5: Replace fourth direct ORM block (reject_application)**

In `reject_application`, lines 487-499, replace:
```python
    from app.notifications.models import Notification, NotificationType
    promoter_user_id = application.promoter_profile.user_id
    notification = Notification(
        recipient_id=promoter_user_id,
        actor_id=business.user_id,
        type=NotificationType.APPLICATION_REJECTED,
        title="Application rejected",
        message=f"Your application for '{campaign.title}' has been rejected.",
        entity_type="campaign_application",
        entity_id=application.id,
    )
    db.add(notification)
    db.commit()
```

With:
```python
    promoter_user_id = application.promoter_profile.user_id
    notification_service = NotificationService(db)
    notification_create = NotificationCreate(
        recipient_id=promoter_user_id,
        actor_id=business.user_id,
        type=NotificationType.APPLICATION_REJECTED,
        title="Application rejected",
        message=f"Your application for '{campaign.title}' has been rejected.",
        entity_type="campaign_invitation",
        entity_id=application.id,
    )
    notification_service.create_notification(notification_create)
```

- [ ] **Step 6: Run lint and quick backend check**

Run: `cd backend && ruff check app/services/collaboration.py`
Expected: no errors

---

### Task 2: Add Missing Notification Creators

**Files:**
- Modify: `backend/app/services/collaboration.py` (add INVITATION_RECEIVED, INVITATION_ACCEPTED, INVITATION_DECLINED, COLLABORATION_STARTED, COLLABORATION_COMPLETED)
- Modify: `backend/app/services/review.py` (add REVIEW_RECEIVED)
- Modify: `backend/app/services/matching.py` (add CAMPAIGN_MATCH_READY)

**Interfaces:**
- Consumes: `NotificationService`, `NotificationCreate`, `NotificationType`
- Produces: new `create_notification()` calls at 6 locations

- [ ] **Step 1: Add INVITATION_RECEIVED in invite_promoter**

In `invite_promoter` (`collaboration.py`), after `db.refresh(invitation)`:
```python
    notification_service = NotificationService(db)
    invitation_notification = NotificationCreate(
        recipient_id=promoter.user_id,
        actor_id=user.id,
        type=NotificationType.INVITATION_RECEIVED,
        title="New campaign invitation",
        message=f"You have been invited to promote '{campaign.title}'",
        entity_type="campaign_invitation",
        entity_id=invitation.id,
    )
    notification_service.create_notification(invitation_notification)
```

- [ ] **Step 2: Add INVITATION_ACCEPTED and COLLABORATION_STARTED in accept_invitation**

In `accept_invitation` (`collaboration.py`), after `collab = _create_collervation_from_invitation(...)`:
```python
    business_user_id = invitation.campaign.business_profile.user_id
    notification_service = NotificationService(db)
    notification_service.create_notification(NotificationCreate(
        recipient_id=business_user_id,
        actor_id=user.id,
        type=NotificationType.INVITATION_ACCEPTED,
        title="Invitation accepted",
        message=f"{user.username} accepted your invitation to promote '{invitation.campaign.title}'",
        entity_type="campaign_invitation",
        entity_id=invitation.id,
    ))
    notification_service.create_notification(NotificationCreate(
        recipient_id=user.id,
        actor_id=business_user_id,
        type=NotificationType.COLLABORATION_STARTED,
        title="Collaboration started",
        message=f"You are now collaborating with {invitation.campaign.business_profile.company_name} on '{invitation.campaign.title}'",
        entity_type="collaboration",
        entity_id=collab.id,
    ))
```

- [ ] **Step 3: Add INVITATION_DECLINED in reject_invitation**

In `reject_invitation` (`collaboration.py`), after status is set to REJECTED:
```python
    business_user_id = invitation.campaign.business_profile.user_id
    notification_service = NotificationService(db)
    notification_service.create_notification(NotificationCreate(
        recipient_id=business_user_id,
        actor_id=user.id,
        type=NotificationType.INVITATION_DECLINED,
        title="Invitation declined",
        message=f"{user.username} declined your invitation to promote '{invitation.campaign.title}'",
        entity_type="campaign_invitation",
        entity_id=invitation.id,
    ))
```

- [ ] **Step 4: Add COLLABORATION_COMPLETED in complete_collaboration**

In `complete_collaboration` (`review.py`), after `db.refresh(collab)`:
```python
    from app.notifications.service import NotificationService
    from app.notifications.schemas import NotificationCreate
    from app.notifications.models import NotificationType
    
    notification_service = NotificationService(db)
    other_party_id = collab.promoter_profile.user_id if user.business_profile else collab.business_profile.user_id
    notification_service.create_notification(NotificationCreate(
        recipient_id=other_party_id,
        actor_id=user.id,
        type=NotificationType.COLLABORATION_COMPLETED,
        title="Collaboration completed",
        message=f"{user.username} completed the collaboration on '{collab.campaign.title}'",
        entity_type="collaboration",
        entity_id=collab.id,
    ))
```

- [ ] **Step 5: Add REVIEW_RECEIVED in create_review**

In `create_review` (`review.py`), after `db.refresh(review)`:
```python
    from app.notifications.service import NotificationService
    from app.notifications.schemas import NotificationCreate
    from app.notifications.models import NotificationType
    
    notification_service = NotificationService(db)
    notification_service.create_notification(NotificationCreate(
        recipient_id=reviewee_id,
        actor_id=user.id,
        type=NotificationType.REVIEW_RECEIVED,
        title="New review received",
        message=f"You received a {rating}-star review from {user.username}",
        entity_type="review",
        entity_id=review.id,
    ))
```

- [ ] **Step 6: Add CAMPAIGN_MATCH_READY in generate_matches**

In `generate_matches` (`matching.py`), after `db.commit()`:
```python
    from app.notifications.service import NotificationService
    from app.notifications.schemas import NotificationCreate
    from app.notifications.models import NotificationType
    
    notification_service = NotificationService(db)
    notification_service.create_notification(NotificationCreate(
        recipient_id=user.id,
        actor_id=user.id,
        type=NotificationType.CAMPAIGN_MATCH_READY,
        title="Match analysis ready",
        message=f"We found {count} potential promoters for your campaign '{campaign.title}'",
        entity_type="campaign",
        entity_id=campaign.id,
    ))
```

- [ ] **Step 7: Run lint**

Run: `cd backend && ruff check app/services/collaboration.py app/services/review.py app/services/matching.py`
Expected: no errors

---

### Task 3: Fix Achievement Double Broadcast

**File:**
- Modify: `backend/app/achievements/service.py`
- Test: manually verify only one WS message arrives

**Interfaces:**
- Consumes: `NotificationService`, `ws_manager`
- Produces: removal of extra `ws_manager.send_personal_message` call

- [ ] **Step 1: Remove redundant WS broadcast**

Delete lines 128-135 in `achievements/service.py`:
```python
                from app.notifications.connection_manager import manager as ws_manager
                from .schemas import AchievementRead
                await ws_manager.send_personal_message({
                    "type": "ACHIEVEMENT_UNLOCKED",
                    "data": {
                        "achievement": AchievementRead.model_validate(achievement).model_dump(mode="json")
                    }
                }, user.id)
```

- [ ] **Step 2: Run lint**

Run: `cd backend && ruff check app/achievements/service.py`
Expected: no errors

---

### Task 4: Standardize API Response

**File:**
- Modify: `backend/app/notifications/routes.py`
- Test: hit endpoint with curl

**Interfaces:**
- Consumes: existing `get_notifications` function
- Produces: typed `response_model`

- [ ] **Step 1: Add response model and annotations**

Replace the `get_notifications` route header and return:
```python
from pydantic import BaseModel

class PaginatedNotificationsResponse(BaseModel):
    items: list
    total: int
    page: int
    pages: int

@router.get("", response_model=PaginatedNotificationsResponse)
```

- [ ] **Step 2: Run lint and test endpoint**

Run: `cd backend && ruff check app/notifications/routes.py`
Then curl: `curl -H "Authorization: Bearer <token>" http://localhost:8000/api/v1/notifications`
Expected: JSON with `items`, `total`, `page`, `pages` keys and valid schema

---

### Task 5: Fix Hardcoded WS URL

**File:**
- Modify: `frontend/src/features/notifications/websocket.ts`
- Test: check value in browser console or with different env

- [ ] **Step 1: Replace hardcoded URL with env var**

Replace line 20:
```ts
const wsUrl = `ws://localhost:8000/ws/notifications?token=${token}`;
```

With:
```ts
const base = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
const wsUrl = `${base}/ws/notifications?token=${token}`;
```

- [ ] **Step 2: Verify lint**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors related to this file

---

### Task 6: Add Delete Button to NotificationCard

**File:**
- Modify: `frontend/src/components/notifications/NotificationCard.tsx`
- Test: render card and click delete

- [ ] **Step 1: Import useDeleteNotification**

Add to imports:
```tsx
import { useMarkNotificationRead, useDeleteNotification } from "../../features/notifications";
```

- [ ] **Step 2: Initialize hook and add button**

Inside component, after `const markRead = ...`:
```tsx
  const deleteNotif = useDeleteNotification();
```

Add a `<button>` next to the unread dot (around line 65):
```tsx
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          deleteNotif.mutate(notification.id);
        }}
        className="text-gray-400 hover:text-red-500 transition-colors ml-auto shrink-0"
        aria-label="Delete notification"
      >
        <Trash2 size={16} />
      </button>
```

Add `Trash2` to lucide import:
```tsx
import { Bell, MessageSquare, Briefcase, Star, CheckCircle, XCircle, Trash2 } from "lucide-react";
```

- [ ] **Step 3: Verify lint**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors

---

### Task 7: Add Load More to Bell Dropdown

**File:**
- Modify: `frontend/src/components/notifications/NotificationBell.tsx`
- Test: click "Show more" and verify more items appear

- [ ] **Step 1: Read current NotificationBell.tsx**

Run: `read frontend/src/components/notifications/NotificationBell.tsx`

- [ ] **Step 2: Add pagination state**

Add at top of component:
```tsx
  const [page, setPage] = useState(1);
```

- [ ] **Step 3: Update the notifications query**

Change the query to use current page:
```tsx
  const { data } = useNotifications({ page, limit: 10 });
```

- [ ] **Step 4: Add Show more button**

After the list render, if `items` has more:
```tsx
      {items && items.length >= 10 && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Show more
        </button>
      )}
```

- [ ] **Step 5: Verify lint**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors

---

### Task 8: Add NotificationPreferences Model and Migration

**Files:**
- Create: `backend/app/notifications/preferences.py`
- Create: `backend/app/db/migrations/versions/20260627_16_notification_preferences.py`
- Modify: `backend/app/notifications/models.py` (optional re-export)

**Interfaces:**
- Produces: `NotificationPreference` SQLAlchemy model, Alembic migration

- [ ] **Step 1: Write failing migration**

Create `backend/app/db/migrations/versions/20260627_16_notification_preferences.py`:
```python
"""notification_preferences

Revision ID: 20260627_16
"""
from alembic import op
import sqlalchemy as sa

revision = "20260627_16"
down_revision = "20260625_15"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "notification_preferences",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notification_pref_user_type", "notification_preferences", ["user_id", "type"], unique=True)

def downgrade():
    op.drop_index("ix_notification_pref_user_type", table_name="notification_preferences")
    op.drop_table("notification_preferences")
```

- [ ] **Step 2: Run migration**

Run: `cd backend && alembic upgrade head`
Expected: `notification_preferences` table created

- [ ] **Step 3: Create preferences model**

Create `backend/app/notifications/preferences.py`:
```python
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime, timezone

class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    enabled = Column(Boolean, nullable=False, server_default="true")
    created_at = Column(DateTime(timezone=True), server_default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notification_preferences")
```

Add `notification_preferences = relationship("NotificationPreference", back_populates="user", cascade="all, delete-orphan")` to the User model in `app/models/user.py`.

- [ ] **Step 4: Run lint and existing tests**

Run: `cd backend && ruff check app/notifications/preferences.py app/models/user.py`
Expected: no errors

---

### Task 9: Add NotificationPreferences Service Helper

**File:**
- Modify: `backend/app/notifications/service.py`
- Modify: `backend/app/notifications/repository.py`

**Interfaces:**
- Consumes: `NotificationPreference` model
- Produces: `is_notification_enabled()` check

- [ ] **Step 1: Add preference check to NotificationService**

Add to `NotificationService` class:
```python
    def is_notification_enabled(self, user_id: UUID, type: NotificationType) -> bool:
        pref = self.repository.get_preference(user_id, type)
        return pref.enabled if pref else True
```

- [ ] **Step 2: Gate creation in create_notification**

At start of `create_notification`, add:
```python
    if not self.is_notification_enabled(obj_in.recipient_id, obj_in.type):
        return None
```

Return `Optional[NotificationResponse]`.

- [ ] **Step 3: Add repository method**

In `repository.py`, add:
```python
    def get_preference(self, user_id: UUID, type: NotificationType) -> Optional[NotificationPreference]:
        return (
            self.session.query(NotificationPreference)
            .filter(NotificationPreference.user_id == user_id, NotificationPreference.type == type.value)
            .first()
        )
```

- [ ] **Step 4: Import NotificationPreference**

Add to `repository.py`:
```python
from .preferences import NotificationPreference
```

- [ ] **Step 5: Run lint**

Run: `cd backend && ruff check app/notifications/service.py app/notifications/repository.py`
Expected: no errors

---

### Task 10: Add NotificationPreferences API Routes

**File:**
- Modify: `backend/app/notifications/routes.py`
- Create: `backend/app/notifications/schemas.py` augmentation (or inline model)

**Interfaces:**
- Consumes: `NotificationPreference` model
- Produces: `GET /api/v1/notifications/preferences`, `PUT /api/v1/notifications/preferences`

- [ ] **Step 1: Add Pydantic schema for response**

In `schemas.py`, add:
```python
from pydantic import BaseModel

class NotificationPreferenceRead(BaseModel):
    id: UUID
    type: str
    enabled: bool

    model_config = {"from_attributes": True}

class NotificationPreferencesResponse(BaseModel):
    preferences: List[NotificationPreferenceRead]

class NotificationPreferencesUpdate(BaseModel):
    preferences: List[dict]
```

- [ ] **Step 2: Add routes**

Add to `routes.py`:
```python
from .schemas import NotificationPreferencesResponse, NotificationPreferencesUpdate
from .models import NotificationType
from .preferences import NotificationPreference

@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prefs = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).all()
    return {"preferences": prefs}

@router.put("/preferences", response_model=NotificationPreferencesResponse)
def update_preferences(
    payload: NotificationPreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user_prefs = {p.type: p for p in db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).all()}
    for item in payload.preferences:
        type_val = item.get("type")
        enabled = item.get("enabled", True)
        existing = user_prefs.get(type_val)
        if existing:
            existing.enabled = enabled
        else:
            new_pref = NotificationPreference(user_id=current_user.id, type=type_val, enabled=enabled)
            db.add(new_pref)
    db.commit()
    updated = db.query(NotificationPreference).filter(NotificationPreference.user_id == current_user.id).all()
    return {"preferences": updated}
```

- [ ] **Step 3: Run lint**

Run: `cd backend && ruff check app/notifications/routes.py app/notifications/schemas.py`
Expected: no errors

---

### Task 11: Wire Preferences into Service

**File:**
- Modify: `backend/app/notifications/service.py` (already started in Task 9)
- Create: seed script or migration op for existing users

**Interfaces:**
- Consumes: `NotificationPreference` model, `NotificationType`
- Produces: seeded preferences for all existing users

- [ ] **Step 1: Add seed method**

In `NotificationService`:
```python
    def seed_preferences(self, user_id: UUID) -> None:
        from app.notifications.models import NotificationType as NT
        existing_types = {
            p.type for p in self.repository.session.query(NotificationPreference)
            .filter(NotificationPreference.user_id == user_id).all()
        }
        for nt in NT:
            if nt.value not in existing_types:
                self.repository.session.add(NotificationPreference(
                    user_id=user_id,
                    type=nt.value,
                    enabled=True,
                ))
        self.repository.session.commit()
```

- [ ] **Step 2: Add migration op to seed existing users**

In the same migration file (or a new `op` in `20260627_16`):
```python
from sqlalchemy import text

def seed_existing_users():
    conn = op.get_bind()
    users = conn.execute(text("SELECT id FROM users")).fetchall()
    types = [
        "APPLICATION_RECEIVED", "APPLICATION_ACCEPTED", "APPLICATION_REJECTED",
        "INVITATION_RECEIVED", "INVITATION_ACCEPTED", "INVITATION_DECLINED",
        "NEW_MESSAGE", "REVIEW_RECEIVED", "COLLABORATION_STARTED",
        "COLLABORATION_COMPLETED", "CAMPAIGN_MATCH_READY", "SYSTEM",
    ]
    for u in users:
        for t in types:
            conn.execute(
                text("INSERT INTO notification_preferences (id, user_id, type, enabled, created_at) VALUES (gen_random_uuid(), :uid, :t, true, now()) ON CONFLICT DO NOTHING"),
                {"uid": str(u.id), "t": t},
            )
```

In `upgrade()`: call `seed_existing_users()` after table creation.

---

### Task 12: Add NotificationPreferences Frontend

**Files:**
- Create: `frontend/src/features/notificationPreferences/api.ts`
- Create: `frontend/src/features/notificationPreferences/hooks.ts`
- Create: `frontend/src/components/notifications/NotificationPreferences.tsx`
- Modify: `frontend/src/features/notifications/index.ts` (export new feature)

**Interfaces:**
- Consumes: `notificationKeys` pattern, existing API client
- Produces: settings UI component

- [ ] **Step 1: Create api.ts**

```ts
import { apiClient } from "@/services/apiClient";

export const preferencesKeys = {
  all: ["notificationPreferences"] as const,
  list: () => [...preferencesKeys.all, "list"] as const,
};

export async function getNotificationPreferences() {
  const { data } = await apiClient.get("/api/v1/notifications/preferences");
  return data.data.preferences;
}

export async function updateNotificationPreferences(preferences: Array<{ type: string; enabled: boolean }>) {
  const { data } = await apiClient.put("/api/v1/notifications/preferences", { preferences });
  return data.data.preferences;
}
```

- [ ] **Step 2: Create hooks.ts**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotificationPreferences, updateNotificationPreferences } from "./api";
import { preferencesKeys } from "./api";

export function useNotificationPreferences() {
  return useQuery({
    queryKey: preferencesKeys.list(),
    queryFn: getNotificationPreferences,
  });
}

export function useUpdateNotificationPreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: () => qc.invalidateQueries({ queryKey: preferencesKeys.all }),
  });
}
```

- [ ] **Step 3: Create NotificationPreferences.tsx**

```tsx
import React from "react";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/features/notificationPreferences";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

export function NotificationPreferences() {
  const { data, isLoading } = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const [localPrefs, setLocalPrefs] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (data) {
      const map: Record<string, boolean> = {};
      data.forEach((p: any) => (map[p.type] = p.enabled));
      setLocalPrefs(map);
    }
  }, [data]);

  const toggle = (type: string) => {
    const next = { ...localPrefs, [type]: !localPrefs[type] };
    setLocalPrefs(next);
    update.mutate(
      Object.entries(next).map(([type, enabled]) => ({ type, enabled }))
    );
  };

  if (isLoading) return <div className="flex items-center gap-2 text-gray-500"><Loader2 className="animate-spin" size={16}/>Loading...</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
      <div className="space-y-3">
        {Object.entries(localPrefs).map(([type, enabled]) => (
          <div key={type} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-700">{type.replace(/_/g, " ").toLowerCase()}</span>
            <Switch checked={enabled} onCheckedChange={() => toggle(type)} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Export from feature index**

Add to `frontend/src/features/notifications/index.ts`:
```ts
export { NotificationPreferences } from "@/components/notifications/NotificationPreferences";
```

- [ ] **Step 5: Verify lint**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors

---

### Task 13: Add Email Digest

**File:**
- Create: `backend/app/notifications/email_digest.py`
- Modify: `backend/app/notifications/service.py` (trigger digest)

**Interfaces:**
- Consumes: `NotificationRepository`, existing email utils
- Produces: async background email task

- [ ] **Step 1: Create email_digest.py**

```python
import asyncio
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import BackgroundTasks

from .repository import NotificationRepository
from app.models.user import User
from app.utils.email import send_email

def _get_users_with_unread(db: Session, since: datetime) -> list[UUID]:
    repo = NotificationRepository(db)
    results = repo.get_unread_since(since)
    user_ids = {r.recipient_id for r in results}
    return list(user_ids)

def _get_unread_for_user(db: Session, user_id: UUID, since: datetime):
    repo = NotificationRepository(db)
    return repo.get_unread_since_by_recipient(user_id, since)

def _format_digest(notifications) -> str:
    lines = []
    for n in notifications:
        lines.append(f"- {n.type}: {n.title}\n  {n.message}")
    return "\n".join(lines)

async def send_daily_digest(db: Session, trigger_user_id: UUID | None = None):
    since = datetime.now(timezone.utc) - timedelta(days=1)
    user_ids = _get_users_with_unread(db, since) if trigger_user_id is None else [trigger_user_id]
    for uid in user_ids:
        notifs = _get_unread_for_user(db, uid, since)
        if not notifs:
            continue
        user = db.query(User).filter(User.id == uid).first()
        if not user or not user.email:
            continue
        body = _format_digest(notifs)
        try:
            send_email(
                to=user.email,
                subject="Your daily notification digest",
                body=f"Hi {user.username},\n\nYou have {len(notifs)} unread notification(s):\n\n{body}\n\nVisit the app to view them.",
            )
        except Exception as e:
            print(f"Failed to send digest to {user.email}: {e}")
```

- [ ] **Step 2: Add digest trigger to create_notification**

In `NotificationService.create_notification()`, after successful broadcast, add: `asyncio.create_task(send_daily_digest(self.repository.session, obj_in.recipient_id))`

- [ ] **Step 3: Add repository method**

In `NotificationRepository`, add:
```python
    def get_unread_since(self, since: datetime):
        return self.session.query(self.model).filter(
            self.model.is_read == False,
            self.model.created_at >= since,
        ).all()

    def get_unread_since_by_recipient(self, user_id: UUID, since: datetime):
        return self.session.query(self.model).filter(
            self.model.recipient_id == user_id,
            self.model.is_read == False,
            self.model.created_at >= since,
        ).all()
```

- [ ] **Step 4: Verify send_email signature exists**

Run: `grep -n "def send_email" backend/app/utils/email.py`
Expected: function exists with `to`, `subject`, `body` params

- [ ] **Step 5: Run lint**

Run: `cd backend && ruff check app/notifications/email_digest.py`
Expected: no errors

---

### Task 14: End-to-End Verification

- [ ] **Step 1: Start backend and frontend**

Run: `cd backend && uvicorn app.main:app --reload` in one terminal
Run: `cd frontend && npm run dev` in another

- [ ] **Step 2: Verify each notification type**

1. Apply to campaign → business sees WebSocket notification instantly
2. Accept/reject application → promoter sees WebSocket notification instantly
3. Send chat message → recipient sees WS notification
4. Unlock achievement → user sees WS notification (not double)
5. Delete a notification → card disappears
6. Toggle preference off → type is suppressed
7. Refresh page with unread notifications → they appear (REST fallback works)

- [ ] **Step 3: Run backend lint and tests**

Run: `cd backend && ruff check . && pytest`
Expected: lint clean, tests pass

- [ ] **Step 4: Run frontend typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no type errors

---

Plan complete and saved to `docs/superpowers/plans/2026-06-27-notification-system-end-to-end.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
