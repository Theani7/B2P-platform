# Global Activity & Event System

## Overview
The B2P Connect Global Activity & Event System serves as the centralized source of truth for tracking user interactions, system events, and platform activity. This system eliminates hardcoded mock timelines and replaces them with a paginated, database-backed activity stream that populates the Business, Promoter, and Admin dashboards.

## Database Schema (`activity_logs`)
- `id` (UUID) - Primary Key
- `actor_id` (UUID) - Foreign Key to `users`
- `actor_role` (String) - Enum: ADMIN, BUSINESS, PROMOTER
- `entity_type` (String) - Type of entity acted upon (e.g., "campaign", "review", "collaboration", "user")
- `entity_id` (String) - Foreign Key to the specific entity
- `action` (String) - The action performed (e.g., "created", "accepted", "published")
- `title` (String) - Human-readable title
- `description` (Text) - Human-readable detailed description
- `metadata` (JSONB) - Arbitrary contextual data
- `created_at` (Timestamp) - Indexed for chronological sorting

## Event Types Tracked
Currently the system tracks the following domain events:
- **Authentication**: `registered`, `email_verified`, `password_reset`
- **Business/Campaigns**: `created`, `updated`, `deleted`, `published`, `closed`
- **Promoter Profiles**: `updated`, `portfolio_updated`, `application_submitted`, `application_withdrawn`
- **Invitations**: `sent`, `accepted`, `declined`, `cancelled`
- **Collaborations**: `started`, `completed`
- **Reviews**: `submitted`, `updated`, `deleted`
- **Matching**: `match_generated`

## API Endpoints
All endpoints support pagination (`?page=1&size=20`) and filtering by `entity_type` and `action`.
- `GET /api/v1/activity/me` - Returns activities relevant strictly to the logged-in user.
- `GET /api/v1/activity/business` - Returns activities relevant strictly to the logged-in user's business context.
- `GET /api/v1/activity/admin` - Returns all platform activities across all users (Requires ADMIN).

## Extension Guidelines
When building new domains, always record an activity log alongside the database mutation in a single transaction if possible.
Use the unified backend service:
```python
await ActivityService.record(
    db=db,
    actor_id=user.id,
    actor_role=user.role,
    entity_type="new_feature",
    entity_id=record.id,
    action="action_name",
    title="Something happened",
    description="More details..."
)
```
