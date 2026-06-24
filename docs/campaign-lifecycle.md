# Campaign Lifecycle

## Overview

Campaigns represent business opportunities that promoters can apply to. Each campaign progresses through a defined status workflow.

## Status Definitions

| Status | Description |
|--------|-------------|
| **DRAFT** | Campaign is being created. Only visible to the business owner. Editable. |
| **OPEN** | Campaign is published and visible to promoters. Accepting applications. |
| **ACTIVE** | Campaign is in progress. Promoters have been selected and work is underway. |
| **COMPLETED** | Campaign has finished successfully. Ready for review and finalization. |
| **ARCHIVED** | Campaign is no longer active but preserved for records. Can be reopened. |
| **CANCELLED** | Campaign was terminated before completion. |

## Status Transition Diagram

```
                  ┌─────────┐
                  │  DRAFT  │
                  └────┬────┘
                       │
                       ▼
                  ┌─────────┐
         ┌────────│  OPEN   │────────┐
         │        └────┬────┘        │
         │             │             │
         │             ▼             │
         │        ┌─────────┐        │
         │        │  ACTIVE │        │
         │        └────┬────┘        │
         │             │             │
         │             ▼             │
         │        ┌───────────┐      │
         │        │ COMPLETED │      │
         │        └───────────┘      │
         │                          │
         │    ┌──────────┐          │
         ├───→│ ARCHIVED │←─────────┘
         │    └─────┬────┘
         │          │ (reopen)
         │          ▼
         │    ┌──────────┐
         └───→│  DRAFT   │
              └──────────┘

    ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─

              ┌───────────┐
    Any ─────→│ CANCELLED │
              └───────────┘
```

## Transition Rules

### Allowed Transitions
1. **DRAFT → OPEN**: Publish the campaign
2. **OPEN → ACTIVE**: Start the campaign (promoters selected)
3. **ACTIVE → COMPLETED**: Campaign finished successfully
4. **Any → ARCHIVED**: Archive from any status
5. **Any → CANCELLED**: Cancel from any status
6. **ARCHIVED → DRAFT**: Reopen an archived campaign

### Disallowed Transitions
- DRAFT → ACTIVE (must go through OPEN)
- DRAFT → COMPLETED (must go through OPEN → ACTIVE)
- OPEN → COMPLETED (must go through ACTIVE)
- Active → OPEN (cannot go backwards)
- COMPLETED → any (terminal, except archive/cancel)

## Visibility

| Visibility | Description |
|------------|-------------|
| **PUBLIC** | Visible in marketplace. Promoters can discover and apply. |
| **PRIVATE** | Visible only to the owning business. Used for internal planning. |

## CRUD Operations

| Operation | Description |
|-----------|-------------|
| **Create** | Business creates a campaign. Defaults to DRAFT/PUBLIC. |
| **Read** | Business views own campaign details. |
| **Update** | Partial update of campaign fields. Status transitions validated. |
| **Delete** | Permanent deletion. Irreversible. |
| **Archive** | Soft-archive (status change). Reversible via reopen. |
| **Reopen** | Restore from ARCHIVED to DRAFT. |

## Future Integration Points

Campaigns are the foundation for:
- **Applications**: Promoters apply to OPEN campaigns
- **Collaboration Requests**: Businesses invite promoters
- **Matching**: Algorithm matches promoters to campaigns
- **Reviews**: Post-campaign reviews between businesses and promoters
- **Messaging**: Communication about campaign collaboration

## Data Isolation

Each business can only access their own campaigns. Campaigns are scoped to `business_profile_id`. The service layer enforces this by filtering on the authenticated user's business profile.
