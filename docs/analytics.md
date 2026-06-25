# Analytics Module Documentation

## Overview
The B2P Connect Analytics module provides a unified, production-grade aggregation layer for calculating key performance indicators (KPIs), charts, and growth metrics across the platform.

It ensures that no dashboard relies on hardcoded data, and uses efficient SQL aggregations to calculate real-time stats directly from the database.

## Endpoints

### 1. Business Analytics
`GET /api/v1/analytics/business`
Requires standard Business authorization.
- **Summary:** Total/active/completed/draft campaigns, total/accepted/rejected/pending applications, active/completed collaborations, saved promoters, avg match score.
- **Charts:** Monthly campaign creation, monthly applications, monthly collaborations, top campaigns by applications, applications per campaign, application status distribution.
- **Growth:** Campaign growth %, Application growth %, Collaboration growth %.

### 2. Promoter Analytics
`GET /api/v1/analytics/promoter`
Requires standard Promoter authorization.
- **Summary:** Profile views, applications submitted/accepted/pending/rejected, invitations received/accepted/pending, active/completed collaborations, average rating, reviews received, recommendation %, portfolio items, profile completion %.
- **Charts:** Monthly applications, monthly collaborations, monthly reviews, invitation acceptance trend, application success trend, rating trend, category breakdown.
- **Growth:** Application growth %, Collaboration growth %.

### 3. Admin Analytics
`GET /api/v1/analytics/admin`
Requires Admin authorization.
- **Summary:** Total users, businesses, promoters, campaigns, applications, collaborations, reviews, active users, verified users.
- **Charts:** Monthly registrations, monthly campaigns, monthly collaborations, monthly reviews, top businesses, top promoters, platform growth, role distribution.
- **Growth:** User growth %, Campaign growth %, Collaboration growth %.

## Standard Response Model
Every endpoint returns a heavily structured JSON payload:
```json
{
  "summary": { ... },
  "charts": { ... },
  "growth": { ... },
  "recent": { ... },
  "metadata": {
    "generated_at": "2026-06-25T12:00:00Z",
    "period": "30_days"
  }
}
```

## Calculations & Formulas

- **Acceptance Rate:** `accepted / total`
- **Completion Rate:** `completed / total`
- **Recommendation %:** `(5-star + 4-star reviews) / total reviews`
- **Average Rating:** `AVG(review.rating)`
- **Growth %:** `((current_period_count - previous_period_count) / max(previous_period_count, 1)) * 100`

Calculations are centralized in `calculations.py` (backend) to ensure consistency.

## Future Extensions
- **Event Streaming / Tracking:** Currently, profile views are static or rely on basic relational counting. Implementing a time-series DB or Redis-backed event store (like `page_view` events) will be necessary for granular "Profile Views" over time.
- **Custom Date Ranges:** Add `?start_date=` and `?end_date=` query parameters.
- **Caching:** Add Redis caching layer (e.g. 5 minute TTL) to reduce heavy SQL aggregations on high-traffic dashboards.
