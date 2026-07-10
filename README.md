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
| UI Components | Radix UI primitives, Recharts for charts |
| Toasts | react-hot-toast |

---

## Quick Start

### Prerequisites
- Node.js 18+
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

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env         # Edit .env if needed

# Run Prisma migrations to set up the schema
npx prisma db push

# Start the server (runs on port 8000 by default)
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env         # Uses NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
npm run dev                  # http://localhost:3000
```

### 5. Seed Data

When the backend starts up (`npm run dev`), it will automatically seed the `platform_settings` and `achievements` if they do not exist.
It will also print the credentials for the default admin user to the terminal.

Default admin credentials:
- Email: `admin@gmail.com`
- Password: `admin123`

---

## Project Structure

```text
byparsathy/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # Database schema definitions
│   ├── src/
│   │   ├── config/              # Environment & DB config
│   │   ├── modules/             # Feature modules (admin, auth, campaigns, chat, discovery, etc.)
│   │   ├── shared/              # Shared utils (auth, errors, jwt, validate, response, socket)
│   │   ├── app.js               # Express application and route mounting
│   │   └── index.js             # Server startup and Socket.io attachment
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
- **Auth**: `/auth/register`, `/auth/login`, `/auth/refresh`, etc.
- **Business**: `/business/profile`, `/business/collaborations`
- **Promoter**: `/promoter/profile`, `/promoter/collaborations`
- **Discovery**: `/promoters`, `/promoters/:username`
- **Campaigns**: `/campaigns`, `/campaigns/:id`, `/campaigns/:id/apply`
- **Admin**: `/admin/users`, `/admin/campaigns`, `/admin/reviews`

---

## Environment Variables

### Backend (`backend/.env`)
- `DATABASE_URL` — PostgreSQL connection string
- `SECRET_KEY` — JWT signing secret
- `PORT` — API server port (default 8000)
- `FRONTEND_URL` — Frontend origin for CORS

### Frontend (`frontend/.env`)
- `NEXT_PUBLIC_API_URL` — Backend API base URL (`http://localhost:8000/api/v1`)
- `NEXT_PUBLIC_WS_URL` — Backend WebSocket URL (`http://localhost:8000`)
- `BACKEND_URL` — Internal Next.js backend proxy route

---

## Code Style

- **JavaScript (Backend)**: ES Modules (`import`/`export`), thin controllers delegating to service layers, Zod validation at the router level.
- **TypeScript (Frontend)**: Strict mode, React Functional components, Server/Client components split natively via Next.js App Router.
- **Tailwind**: Use design token color keys (`bg-primary`, `text-danger`, `text-success`) from `tailwind.config.ts`.
- **Modals**: Render confirmation modals and overlay UIs through the specialized `<Portal>` component to prevent z-index collision.
