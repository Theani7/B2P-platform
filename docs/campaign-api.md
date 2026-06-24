# Campaign API Documentation

Base URL: `/api/v1`

All campaign endpoints require **BUSINESS** role. Promoters and unauthenticated users receive `403`.

## Authentication

All requests require `Authorization: Bearer <access_token>` header.

---

## Endpoints

### Create Campaign

`POST /campaigns`

Creates a new campaign. Defaults to `DRAFT` status and `PUBLIC` visibility.

**Request body:**

```json
{
  "title": "Summer Promo Campaign",
  "description": "Looking for influencers to promote our summer collection...",
  "category": "MARKETING",
  "budget": 5000.0,
  "location": "Remote",
  "target_audience": "18-35 year olds",
  "requirements": "Min 10k followers",
  "start_date": "2026-07-01T00:00:00Z",
  "end_date": "2026-08-31T00:00:00Z",
  "visibility": "PUBLIC",
  "status": "DRAFT"
}
```

**Response** `201`

```json
{
  "id": "uuid",
  "business_profile_id": "uuid",
  "title": "Summer Promo Campaign",
  "description": "Looking for influencers...",
  "category": "MARKETING",
  "budget": 5000.0,
  "location": "Remote",
  "target_audience": "18-35 year olds",
  "requirements": "Min 10k followers",
  "start_date": "2026-07-01T00:00:00Z",
  "end_date": "2026-08-31T00:00:00Z",
  "status": "DRAFT",
  "visibility": "PUBLIC",
  "created_at": "2026-06-24T12:00:00Z",
  "updated_at": "2026-06-24T12:00:00Z"
}
```

---

### List Own Campaigns

`GET /campaigns`

Returns paginated list of campaigns owned by the authenticated business.

**Query parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Filter by title/description (case-insensitive LIKE) |
| `page` | integer | 1 | Page number (min 1) |
| `limit` | integer | 10 | Items per page (1-100) |
| `sort` | string | `created_at` | Sort field |

**Response** `200`

```json
{
  "items": [ ... ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "pages": 1
}
```

---

### Get Campaign

`GET /campaigns/{id}`

Returns a single campaign by ID. Only accessible by the owning business.

**Response** `200` → Campaign object
**Response** `404` → Not found

---

### Update Campaign

`PUT /campaigns/{id}`

Updates campaign fields. Only provided fields are updated (partial update).
Validates status transitions on the server side.

**Request body** (all fields optional):

```json
{
  "title": "Updated Title",
  "status": "OPEN"
}
```

**Response** `200` → Updated campaign object

---

### Delete Campaign

`DELETE /campaigns/{id}`

Permanently deletes a campaign. **Response** `204` (no content).

---

### Archive Campaign

`POST /campaigns/{id}/archive`

Sets status to `ARCHIVED`. Allowed from any status.

**Response** `200` → Updated campaign object

---

### Reopen Campaign

`POST /campaigns/{id}/reopen`

Sets status from `ARCHIVED` back to `DRAFT`. Only works on archived campaigns.

**Response** `200` → Updated campaign object
**Response** `400` → Campaign is not archived

---

### Dashboard Stats

`GET /campaigns/dashboard/stats`

Lightweight stats endpoint for the business dashboard.

**Response** `200`

```json
{
  "total_campaigns": 10,
  "open_campaigns": 3,
  "active_campaigns": 2,
  "completed_campaigns": 5,
  "recent_campaigns": [
    {
      "id": "uuid",
      "title": "Recent Campaign",
      "status": "OPEN",
      "budget": 5000.0,
      "created_at": "2026-06-24T12:00:00Z"
    }
  ]
}
```

---

## Validation Rules

| Field | Rule |
|-------|------|
| `title` | Required, max 255 chars |
| `description` | Required, min 20 chars |
| `category` | Required |
| `budget` | Required, must be > 0 |
| `location` | Required |
| `start_date` | Required |
| `end_date` | Required, must be >= start_date |

---

## Status Transition Rules

```
DRAFT    → OPEN
OPEN     → ACTIVE
ACTIVE   → COMPLETED
Any      → ARCHIVED
Any      → CANCELLED
ARCHIVED → DRAFT (via reopen)
```
