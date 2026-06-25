# Global Search & Universal Search Architecture

## 1. Overview
The search module (PH-2.9) unifies discovery across Campaigns, Promoters, Businesses, Collaborations, Messages, and Users into a single `/api/v1/search` endpoint.

## 2. API Endpoints
- `GET /api/v1/search?q={query}&type={optional}&page={int}&limit={int}`
- `GET /api/v1/search/history` - Returns last 10 search queries for the user.
- `DELETE /api/v1/search/history` - Clears the user's history.

## 3. Permissions Strategy
Role-aware filtering restricts data access natively at the repository tier:
- Admins: Unrestricted read.
- Businesses: Restricted to active campaigns, open promoter profiles, and existing collaborations.
- Promoters: Restricted to visible business data and active collaborations.

## 4. Ranking System
Uses a modular scoring approach in `RankingEngine`:
1. Exact matches (+100)
2. Prefix matches (+50)
3. Partial contains matches (+25)
4. Subtitle matching (+10)

## 5. Future Enhancements
- Upgrade to PostgreSQL Full-Text Search (`tsvector`, `tsquery`).
- Integrate Elasticsearch or Typesense if scalability limits are reached.
- Implement AI-driven Semantic Search utilizing vector embeddings (pgvector).
