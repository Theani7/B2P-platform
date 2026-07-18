# Byparsathy — Brand to Promoter Collaboration Platform

A full-stack SaaS platform connecting brands (businesses) with social media promoters/influencers for marketing campaigns. Built with **Next.js + Express (Node.js) + Prisma + PostgreSQL**.

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
- **Realtime Chat & Notifications** — Instant messaging for active collaborations and realtime notification delivery via Socket.io.
- **Admin Panel** — Dashboard stats, user management (suspend/activate/soft-delete), campaign moderation, review moderation, verification request approval/rejection, platform settings, analytics
- **Promoter Verification** — Request, approve, reject, and revoke verified status
- **Profile Enrichment** — Portfolio items, social links, and profile-completion scoring
- **Achievements & Activity** — Gamified achievement unlocks and per-role activity timelines
- **Search & Export** — Cross-entity search with history, and CSV/JSON data export
- **File Uploads** — Avatars, logos, portfolio images, and chat attachments (served from `/uploads`)
- **AI Assistance** — AI-powered features via Groq (`ai` module)

---

## Tech Stack

### Backend
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Express.js (ESM) |
| ORM | Prisma ORM |
| Database | PostgreSQL 16 |
| Validation | Zod |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| Realtime | Socket.io |
| AI | Groq SDK |

### Frontend
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Data Fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios (interceptors for token refresh) |
| Charts | Recharts |
| PDF Export | jsPDF + jspdf-autotable |
| Animation | Framer Motion |
| Toasts | react-hot-toast |

---

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) 1.3+ — used for installing deps (`bun.lock`) and running both apps
- PostgreSQL 16 (or Docker)

### 1. Clone the Repository

```bash
git clone <repo-url>
cd byparsathy
git checkout convert/nextjs-express
```

### 2. PostgreSQL Setup

```bash
# Option A: Local PostgreSQL
createdb b2p_db

# Option B: Docker (standalone)
docker run -d --name byparsathy-db -e POSTGRES_DB=b2p_db \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 postgres:16-alpine
```

### 3. Install Dependencies

From the repo root, install both workspaces at once (writes a single `bun.lock`):

```bash
bun install            # installs backend + frontend workspaces
```

> Re-run only when dependencies change (e.g. after a `git pull` that edits a `package.json`).

### 4. Configure Environment

```bash
cp backend/.env.example backend/.env      # edit SECRET_KEY, SMTP, admin creds as needed
cp frontend/.env.example frontend/.env    # defaults point at http://localhost:8000
```

### 5. Set Up the Database Schema

```bash
cd backend
bunx prisma db push        # sync schema to the database
bunx prisma generate       # regenerate the Prisma client (usually runs on install)
cd ..
```

> One-time on fresh setup. Re-run only after `prisma/schema.prisma` changes — `db push` is a safe no-op when already in sync.

### 6. Run

Both apps together, from the repo root:

```bash
bun run dev            # backend :8000 + frontend :3000 together
bun run dev:backend    # backend only
bun run dev:frontend   # frontend only
```

Steps 1–5 are one-time setup; day-to-day you only run `bun run dev`.

### 7. Seed Data

On first boot the backend automatically seeds `platform_settings`, `achievements`, and a default admin user (from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`), printing the credentials to the terminal.

Default dev admin credentials (from `.env.example`):
- Email: `admin@gmail.com`
- Password: `admin123`

> In production, the admin is only seeded when a strong `ADMIN_PASSWORD` and non-default `SECRET_KEY` are set.

---

## Project Structure

```text
byparsathy/
├── package.json                 # Root: bun workspaces + `bun run dev` for both apps
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definitions
│   │   └── migrations/          # Prisma migrations (0_init)
│   ├── src/
│   │   ├── config/              # Environment & DB config
│   │   ├── modules/             # Feature modules (auth, campaign, chat, matching, ai, admin, etc.)
│   │   ├── shared/              # Shared utils (auth, errors, jwt, validate, response, socket, notify)
│   │   ├── app.js               # Express application and route mounting
│   │   └── index.js             # Server startup and Socket.io attachment
│   ├── uploads/                 # Uploaded files served at /uploads
│   └── .env.example
├── frontend/
│   ├── app/                     # Next.js 15 App Router pages
│   │   ├── (app)/               # Authenticated layouts (admin, business, promoter)
│   │   ├── (auth)/              # Authentication pages
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Landing page
│   ├── components/              # Shared UI components
│   ├── features/                # API hooks grouped by feature
│   ├── lib/                     # Utilities (apiClient, queryClient)
│   ├── tailwind.config.ts
│   ├── next.config.mjs
│   └── .env.example
└── AGENTS.md                    # Agent instructions & development plan
```

---

## API Documentation

All REST endpoints are prefixed with `/api/v1`. Real-time socket events connect at the root.

Detailed module endpoints:
- **Auth**: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`
- **Business**: `/business/profile`, `/business/collaborations`, `/business/applications`, `/business/invitations`
- **Promoter**: `/promoter/profile`, `/promoter/collaborations`, `/promoter/portfolio`, `/promoter/applications`
- **Discovery**: `/promoters`, `/promoters/:username`
- **Campaigns**: `/campaigns`, `/campaigns/:id`, `/campaigns/:id/apply`, `/campaign-marketplace`
- **Matching**: `/campaigns/:id/generate-matches`, `/campaigns/:id/matches`
- **Reviews**: `/collaborations/:id/reviews`, `/users/:id/rating`
- **Realtime**: `/notifications`, `/chat/conversations` (+ Socket.io events)
- **Engagement**: `/achievements`, `/activity`, `/search`, `/export`, `/sharing`
- **Uploads**: `/upload` (avatar, logo, portfolio-image, chat-attachment)
- **Admin**: `/admin/users`, `/admin/campaigns`, `/admin/reviews`, `/admin/audit-logs`, `/admin/settings`

---

## Environment Variables

### Backend (`backend/.env`)
- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — JWT signing secret (must be non-default in production)
- `PORT` — API server port (default 8000)
- `FRONTEND_URL` — Frontend origin used in shareable links
- `ALLOWED_ORIGINS` — Comma-separated CORS origins
- `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` — Token lifetimes (default 30 min / 7 days)
- `MAX_FAILED_LOGIN_ATTEMPTS` / `LOCK_MINUTES` — Account lockout policy
- `RATE_LIMIT_AUTH` — Auth-endpoint requests per minute per IP
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USERNAME` / `SMTP_PASSWORD` / `EMAIL_FROM` — Email delivery
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — Seed admin credentials on first boot
- `GROQ_API_KEY` — API key for AI features

### Frontend (`frontend/.env`)
- `NEXT_PUBLIC_API_URL` — Backend API base URL (`http://localhost:8000/api/v1`)
- `NEXT_PUBLIC_WS_URL` — Backend Socket.io URL (`http://localhost:8000`)
- `BACKEND_URL` — Backend origin for Next.js server-side proxy rewrites

---

## Code Style

- **JavaScript (Backend)**: ES Modules (`import`/`export`), thin controllers delegating to service layers, Zod validation at the router level.
- **TypeScript (Frontend)**: Strict mode, React Functional components, Server/Client components split natively via Next.js App Router.
- **Tailwind**: Use the design tokens defined in `tailwind.config.ts` / `DESIGN.md` (e.g. `signal-blue`, `linen-canvas`, `midnight-ink`; form errors use `text-brand-coral`).
- **Modals**: Render confirmation modals and overlay UIs through the specialized `<Portal>` component to prevent z-index collision.
