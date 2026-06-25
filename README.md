# Byparsathy — Brand to Promoter Collaboration Platform

A full-stack SaaS platform connecting brands (businesses) with social media promoters/influencers for marketing campaigns. Built with **FastAPI + React + PostgreSQL**.

---

## Features

- **Authentication & Security** — JWT access/refresh token rotation, email verification, password reset, account lockout after failed attempts, rate-limited auth endpoints
- **Role-Based Access Control** — Three roles: `BUSINESS`, `PROMOTER`, `ADMIN` with granular route protection
- **Business Profiles** — Company details, industry, location, website, logo, company size
- **Promoter Profiles** — Username, headline, bio, niche, location, followers, engagement rate, experience, portfolio items, social links, verified badge
- **Campaign Management** — Full CRUD with status lifecycle: `DRAFT → OPEN → ACTIVE → COMPLETED → ARCHIVED` (or `CANCELLED`)
- **Promoter Directory** — Search, filter (niche, location, followers, experience, verified), and sort (newest, followers, engagement, experience)
- **Saved Promoters (Shortlist)** — Businesses can save/bookmark promoter profiles
- **Campaign Marketplace** — Public campaigns browseable by promoters
- **Campaign Applications** — Promoters apply to campaigns; businesses review, accept, or reject
- **Campaign Invitations** — Businesses invite promoters to campaigns; promoters accept, reject, or let expire
- **Smart Matching Engine** — Rule-based scoring (niche, location, followers, experience, engagement) with classification (`EXCELLENT`, `GOOD`, `FAIR`, `POOR`) and score breakdown
- **Collaboration Management** — Active, completed, and cancelled collaborations linking campaigns, businesses, and promoters
- **Review & Rating System** — Mutual reviews (business↔promoter) per collaboration with 1–5 star ratings
- **Admin Panel** — Dashboard stats, user management (suspend/activate/soft-delete), campaign moderation, review moderation, verification request approval/rejection, platform settings, audit logs, analytics
- **Audit Logging** — All admin actions recorded with IP, user agent, and extra data
- **Promoter Verification** — Request, approve, reject, and revoke verified status

---

## Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Runtime | Python 3.9 |
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Auth | JWT (python-jose + cryptography) |
| Password Hashing | passlib (bcrypt) |
| Rate Limiting | In-memory middleware (configurable) |

### Frontend
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | React 19 |
| Language | TypeScript 5 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Routing | React Router 6 |
| Data Fetching | TanStack Query 5 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (interceptors for token refresh) |
| Toasts | react-hot-toast |
| Testing | Vitest + Testing Library |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Containerization | Docker + Docker Compose |
| Web Server | Nginx (frontend) |
| Database | PostgreSQL 16 Alpine |

---

## Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 16 (or Docker)
- Docker & Docker Compose (optional)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd B2P
```

### 2. PostgreSQL Setup

```bash
# Option A: Local PostgreSQL
createdb b2p_db

# Option B: Docker (standalone)
docker run -d --name b2p-db -e POSTGRES_DB=b2p_db \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine
```

### 3. Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # Edit .env if needed
alembic upgrade head
uvicorn app.main:app --reload   # http://localhost:8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env         # VITE_API_URL defaults to /api/v1
npm run dev                  # http://localhost:5173
```

### 5. Seed Data

Populate the database with 10 businesses, 30 promoters, 100 campaigns, 300+ applications, invitations, collaborations, reviews, and match results:

```bash
cd backend
python -m app.seed_data
```

Default password for all seeded accounts: `SeedPass123!`

| Role | Example Login |
|------|---------------|
| Admin | `admin@b2pconnect.com` |
| Business | `hello@techvibe.io` |
| Promoter | `starlight_emma@example.com` |

### 6. Docker Deployment

```bash
docker compose up -d
# Backend: http://localhost:8000
# Frontend: http://localhost:80
```

---

## Project Structure

```
B2P/
├── backend/
│   ├── app/
│   │   ├── api/v1/              # Route handlers
│   │   │   ├── admin/           # Admin panel endpoints (14 endpoints)
│   │   │   ├── applications/    # Campaign applications
│   │   │   ├── auth/            # Registration, login, refresh, verify, reset
│   │   │   ├── business/        # Business profile CRUD + saved promoters
│   │   │   ├── campaign/        # Campaign CRUD + dashboard stats
│   │   │   ├── collaborations/  # Collaboration listing
│   │   │   ├── invitations/     # Campaign invitations
│   │   │   ├── marketplace/     # Campaign marketplace
│   │   │   ├── matching/        # Smart matching generate + query
│   │   │   ├── portfolio/       # Promoter portfolio items
│   │   │   ├── promoter/        # Promoter profile CRUD
│   │   │   ├── promoter_verification/  # Verification requests
│   │   │   ├── reviews/         # Review CRUD + rating summaries
│   │   │   ├── social_links/    # Promoter social links
│   │   │   └── upload/          # File uploads
│   │   ├── core/                # Config, security, role enums
│   │   ├── db/                  # Session, Base, Alembic migrations
│   │   ├── dependencies/        # Auth dependencies (get_current_user, require_role)
│   │   ├── exceptions/          # Error handlers, AppError
│   │   ├── middleware/          # Rate limiting, security headers
│   │   ├── models/              # 17 SQLAlchemy models
│   │   ├── schemas/             # Pydantic v2 request/response schemas
│   │   ├── services/            # Business logic layer
│   │   └── utils/               # Email, token generation, file upload
│   ├── tests/                   # 139 pytest tests
│   │   ├── test_auth.py
│   │   ├── test_auth_extended.py
│   │   ├── test_auth_password.py
│   │   ├── test_campaigns.py
│   │   ├── test_collaboration.py
│   │   ├── test_discovery.py
│   │   ├── test_matching.py
│   │   ├── test_portfolio.py
│   │   ├── test_profile.py
│   │   ├── test_reviews.py
│   │   ├── test_social_links.py
│   │   └── test_admin.py
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/          # Shared UI (LoadingSpinner, ErrorBoundary, StatusBadge, EmptyState, CampaignForm, reviews/, matching/)
│   │   │   └── ui/             # Generic UI primitives
│   │   ├── constants/           # Role enum, labels
│   │   ├── features/            # Feature modules (auth, campaigns, profile, matching, admin, discovery, collaboration, reviews)
│   │   │   └── */{api.ts, types.ts}
│   │   ├── hooks/               # Custom hooks (useToast)
│   │   ├── layouts/             # DashboardLayout, AuthLayout
│   │   ├── pages/               # 31 route pages
│   │   ├── providers/           # AuthProvider context
│   │   ├── services/            # Axios API client with token refresh interceptor
│   │   └── test/                # Test setup
│   ├── tailwind.config.ts
│   ├── nginx.conf               # Nginx config for production
│   └── .env.example
├── docs/                        # Architecture, API, auth flow, DB schema docs
├── docker-compose.yml           # Production deployment (db + backend + frontend)
├── Dockerfile                   # Backend container
├── Dockerfile.frontend          # Frontend container (Nginx)
├── .github/workflows/           # CI workflows
└── .pre-commit-config.yaml
```

---

## API Documentation

All endpoints are prefixed with `/api/v1`.

### Authentication (`/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user (returns tokens) |
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/logout` | Logout (client-side) |
| POST | `/auth/refresh` | Rotate refresh token, get new pair |
| POST | `/auth/verify-email` | Verify email with token |
| POST | `/auth/forgot-password` | Request password reset email |
| POST | `/auth/reset-password` | Reset password with token |
| GET | `/auth/me` | Get current user profile |

### Business Profiles (`/business`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/business/profile` | Create business profile |
| GET | `/business/profile` | Get own business profile |
| PUT | `/business/profile` | Update business profile |
| DELETE | `/business/profile` | Delete business profile |

### Promoter Profiles (`/promoter`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/promoter/profile` | Create promoter profile |
| GET | `/promoter/profile` | Get own promoter profile |
| PUT | `/promoter/profile` | Update promoter profile |
| DELETE | `/promoter/profile` | Delete promoter profile |

### Public Promoter Profiles (`/promoters`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/promoters/{username}` | Get public promoter profile (no auth) |

### Promoter Directory (`/promoters`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/promoters` | Search/filter/sort promoter directory (business only) |

### Saved Promoters (`/business/saved-promoters`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/business/saved-promoters/{promoter_id}` | Save promoter to shortlist |
| DELETE | `/business/saved-promoters/{promoter_id}` | Remove from shortlist |
| GET | `/business/saved-promoters` | List saved promoters |

### Campaigns (`/campaigns`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/campaigns` | Create campaign |
| GET | `/campaigns` | List own campaigns (search, page, sort) |
| GET | `/campaigns/dashboard/stats` | Campaign dashboard statistics |
| GET | `/campaigns/{id}` | Get campaign details |
| PUT | `/campaigns/{id}` | Update campaign |
| DELETE | `/campaigns/{id}` | Delete campaign |
| PATCH | `/campaigns/{id}/archive` | Archive campaign |
| PATCH | `/campaigns/{id}/reopen` | Reopen campaign |

### Campaign Marketplace (`/campaign-marketplace`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/campaign-marketplace` | Browse public campaigns (search, page, sort) |

### Campaign Applications (`/campaigns/{id}/apply`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/campaigns/{campaign_id}/apply` | Apply to campaign (promoter) |
| GET | `/campaigns/{campaign_id}/applications` | List applications for campaign (business) |
| PATCH | `/campaigns/{campaign_id}/applications/{app_id}/status` | Accept/reject application |
| GET | `/promoter/applications` | List own applications (promoter) |
| PATCH | `/promoter/applications/{app_id}/withdraw` | Withdraw application |

### Campaign Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/campaigns/{id}/invite/{promoter_id}` | Invite promoter (business) |
| GET | `/business/invitations` | List sent invitations |
| GET | `/promoter/invitations` | List received invitations |
| PATCH | `/promoter/invitations/{id}/accept` | Accept invitation |
| PATCH | `/promoter/invitations/{id}/reject` | Reject invitation |

### Collaborations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/business/collaborations` | List business collaborations |
| GET | `/promoter/collaborations` | List promoter collaborations |

### Smart Matching (`/campaigns/{campaign_id}`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/campaigns/{campaign_id}/generate-matches` | Generate matches |
| GET | `/campaigns/{campaign_id}/matches` | Get matches (filter by score, classification, verified) |

### Reviews & Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/collaborations/{collaboration_id}/reviews` | Create review |
| PUT | `/reviews/{review_id}` | Update review |
| DELETE | `/reviews/{review_id}` | Delete review |
| GET | `/my/reviews` | List own reviews |
| GET | `/users/{user_id}/reviews` | List user's received reviews |
| GET | `/users/{user_id}/ratings` | Get rating summary for user |

### Admin Panel (`/admin`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard statistics |
| GET | `/admin/users` | List all users (search, filter by role/active) |
| GET | `/admin/users/{user_id}` | User detail |
| PATCH | `/admin/users/{user_id}/suspend` | Suspend user |
| PATCH | `/admin/users/{user_id}/activate` | Activate user |
| DELETE | `/admin/users/{user_id}` | Soft-delete user |
| GET | `/admin/verification-requests` | List verification requests |
| POST | `/admin/verification-requests/{id}/approve` | Approve verification |
| POST | `/admin/verification-requests/{id}/reject` | Reject verification |
| POST | `/admin/promoters/{profile_id}/revoke-verification` | Revoke verification |
| GET | `/admin/campaigns` | List all campaigns (search, filter by status) |
| PATCH | `/admin/campaigns/{id}/archive` | Archive campaign |
| PATCH | `/admin/campaigns/{id}/cancel` | Cancel campaign |
| GET | `/admin/reviews` | List all reviews |
| DELETE | `/admin/reviews/{review_id}` | Delete review |
| GET | `/admin/audit-logs` | List audit logs (filter by action, user, date) |
| GET | `/admin/settings` | Get all platform settings |
| GET | `/admin/settings/seed` | Seed default settings |
| PUT | `/admin/settings/{key}` | Update platform setting |
| GET | `/admin/analytics` | Get analytics data |

### Portfolio & Social Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST/GET/PUT/DELETE | `/portfolio` | Promoter portfolio items CRUD |
| POST/GET/DELETE | `/social-links` | Promoter social links CRUD |

---

## Database Schema

17 tables across 4 domains:

### Users & Auth
| Table | Description |
|-------|-------------|
| `users` | Core user accounts (id, username, email, password_hash, role, is_active, is_verified, failed_login_attempts, locked_until, last_login_at) |
| `revoked_refresh_tokens` | Token blacklist for refresh token rotation |

### Profiles
| Table | Description |
|-------|-------------|
| `business_profiles` | Business info (company_name, industry, description, location, website, logo_url, company_size) |
| `promoter_profiles` | Promoter info (username, headline, bio, niche, location, avatar_url, followers_count, engagement_rate, years_experience, verified) |
| `portfolio_items` | Promoter portfolio (title, description, image_url, external_link) |
| `social_links` | Promoter social platform links (platform, url) |

### Campaigns & Matching
| Table | Description |
|-------|-------------|
| `campaigns` | Campaigns (title, description, category, budget, location, target_audience, requirements, start_date, end_date, status, visibility) |
| `saved_promoters` | Business shortlist (business ↔ promoter) |
| `campaign_applications` | Promoter applications (message, status: PENDING/ACCEPTED/REJECTED/WITHDRAWN) |
| `campaign_invitations` | Business invitations (message, status: PENDING/ACCEPTED/REJECTED/EXPIRED) |
| `match_results` | Smart matching scores (score, classification, score_breakdown JSON) |

### Collaborations & Reviews
| Table | Description |
|-------|-------------|
| `collaborations` | Active/completed partnerships (links campaign, business, promoter; application or invitation origin) |
| `reviews` | Mutual ratings (rating 1–5, comment; unique per collaboration+reviewer) |

### Admin
| Table | Description |
|-------|-------------|
| `audit_logs` | Admin action audit trail (user, action, entity_type, entity_id, ip_address, user_agent, extra_data) |
| `platform_settings` | Configurable key-value settings (setting_key, setting_value, description) |
| `verification_requests` | Promoter verification workflow (status: PENDING/APPROVED/REJECTED, admin_notes) |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+psycopg2://postgres:postgres@localhost/b2p_db` | PostgreSQL connection string |
| `SECRET_KEY` | `CHANGE_ME_IN_PROD` | JWT signing secret |
| `JWT_AUDIENCE` | `api.b2p.com` | JWT audience claim |
| `JWT_ISSUER` | `auth.b2p.com` | JWT issuer claim |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token lifetime (minutes) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime (days) |
| `RATE_LIMIT_AUTH` | `30` | Auth endpoint rate limit (requests/minute) |
| `MAX_FAILED_LOGIN_ATTEMPTS` | `5` | Lockout threshold |
| `LOCK_MINUTES` | `15` | Lockout duration (minutes) |
| `ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | CORS allowed origins |
| `PROJECT_NAME` | `Byparsathy` | Application name |
| `API_V1_STR` | `/api/v1` | API version prefix |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `/api/v1` | Backend API base URL (Vite proxy in dev, Nginx in prod) |

---

## Testing

### Backend (139 tests)

```bash
cd backend
python -m pytest                    # Run all tests
python -m pytest -v                 # Verbose
python -m pytest tests/test_auth.py # Single file
```

Test coverage includes: authentication (register, login, refresh, token rotation, email verification, password reset, lockout), campaigns (CRUD, status transitions), collaboration management, promoter discovery/search, smart matching engine, portfolio, profile operations, reviews, social links, and admin endpoints.

### Frontend

```bash
cd frontend
npm test                            # Vitest
```

---

## Contributing

### Branch Naming

- `feature/<description>` — New features
- `fix/<description>` — Bug fixes
- `chore/<description>` — Maintenance, CI, config changes

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following existing code conventions
3. Add tests for new functionality
4. Run `pre-commit run --all-files` to enforce linting/formatting
5. Ensure all tests pass: `python -m pytest` (backend) and `npm test` (frontend)
6. Open a PR against `main` with a concise description

### Code Style

- **Python**: Type hints required, use `from __future__ import annotations` where applicable, follow FastAPI conventions
- **Pydantic v2**: Use `model_validator` / `field_validator` (not v1-style `@validator`)
- **SQLAlchemy 2.0**: Use `select()` style queries where possible, model imports from `app.models`
- **TypeScript**: Strict mode, explicit return types, no `any`
- **React**: Functional components with hooks, TanStack Query for server state, lazy-loaded routes
- **Tailwind**: Use design token color keys (`bg-primary`, `text-danger`, `text-success`) from `tailwind.config.ts`

---

## License

MIT
