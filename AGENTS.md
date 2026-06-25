## Git workflow

- On major changes (new features, config changes, bug fixes), commit and push to GitHub. Use concise commit messages matching repo style.

## Backend specifics agents must know

- **JWT secret**: `settings.SECRET_KEY` defaults to `"CHANGE_ME_IN_PROD"`; override via environment variable `SECRET_KEY` for any non‑dev run.
- **Token lifetimes**: Access 30 min, Refresh 7 days – defined in `app/core/config.py`.
- **Password hashing**: Passlib `bcrypt`; never store plain passwords.
- **Role enum** lives in `app/core/role.py` as `Role`; import with `from app.core.role import Role, RoleEnum`.
- **Account lockout**: After `MAX_FAILED_LOGIN_ATTEMPTS` attempts, `locked_until = now() + LOCK_MINUTES`. Configurable via env vars.
- **Refresh token rotation**: On `/auth/refresh`, old token is revoked, new pair issued. Blacklist table `revoked_refresh_tokens` prevents reuse.
- **Email verification**: Users must verify email before accessing protected resources. Endpoint: `POST /auth/verify-email`.
- **Password reset**: `POST /auth/forgot-password` and `POST /auth/reset-password` with time‑limited tokens.
- **Auth dependencies**:
  - `get_current_user` validates the `Authorization: Bearer <token>` header.
  - `require_role(RoleEnum.X)` is a dependency factory; add with `Depends(require_role(RoleEnum.ADMIN))` to protect routes.
- **Database session**: Always use the `get_db` dependency from `app/db/session.py`. Do **not** create a `Session` manually.
- **Alembic env** (`app/db/migrations/env.py`) reads settings from `app/core/config.py`, so any change to `DATABASE_URL` automatically applies on migration runs.
- **API envelope**: All responses follow `{ success, data?, message?, errors? }`. Global handlers in `app/exceptions/handlers.py` ensure this.
- **Rate limiting**: Auth endpoints limited to 5 requests/minute per IP (configurable via `RATE_LIMIT_AUTH`).
- **Security headers**: `SecureHeadersMiddleware` adds HSTS, CSP, X‑Frame‑Options, etc.

---

## Frontend specifics agents must know

- **API client** (`src/services/apiClient.ts`) injects `access_token` from `localStorage` on every request.
- **Refresh flow**: Axios interceptor catches 401, calls `/auth/refresh` with stored `refresh_token`, updates both tokens, then retries the original request.
- **Auth hooks** (`src/features/auth/api.ts`):
  - `useRegister` & `useLogin` store tokens in `localStorage` on success.
  - `useCurrentUser` is enabled only if an `access_token` exists.
  - `useLogout` clears storage and redirects to `/login`.
- **Role‑based routing** (`src/routes.tsx`):
  - `ProtectedRoute` ensures authenticated users with correct role.
  - `GuestRoute` redirects logged‑in users to their dashboard.
  - `RoleRedirect` sends root (`/`) to the appropriate dashboard.
- **Shared role enum**: `src/constants/roles.ts` exports `Role` enum; use everywhere to avoid magic strings.
- **Tailwind design system** (`tailwind.config.ts`): **Use `B2P_FRONTEND_DESIGN.md` as the single source of truth for all design tokens.** Colors, typography, spacing, border radius, and component specs are defined there. Key tokens:
  - Brand colors: `brand-purple` (#7F77DD), `brand-teal` (#1D9E75), `brand-coral` (#D85A30), `brand-amber` (#BA7517) with -50/-900 variants
  - Semantic grays: `gray-50` (page bg), `white` (cards), `gray-100` (borders), `gray-500` (meta text), `gray-900` (body text)
  - Match score rules: ≥85 → teal, 70–84 → amber, <70 → neutral gray
  - Font: Inter (400/500 weights only), specific scale in spec
  - Spacing: 2/3/4/5/6/8/12 scale only
  - Radius: rounded (9999px), rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)
  - **No box-shadows** — depth from borders and bg layering only
  - Layout shell: 200px fixed sidebar, `bg-white` sidebar / `bg-gray-50` page bg
- **Form validation**: All forms use **React Hook Form** + **Zod**; errors rendered with `text-brand-coral` (not `text-danger`). No native HTML `required`.
- **Toasts**: Use `notifySuccess`, `notifyError` from `src/hooks/useToast.ts`.
- **Code splitting**: Routes use `React.lazy` + `Suspense` with `<LoadingSpinner />`.
- **Error handling**: Wrap app in `<ErrorBoundary>`.

---

## Common gotchas

- **Missing DB** → API returns 500; start PostgreSQL (`createdb b2p_db` or Docker) before backend.
- **Token expiration** → Access token expires after 30 min; Axios interceptor handles silent refresh if a valid refresh token exists.
- **Environment variables**:
  - `SECRET_KEY` (backend) – must be set for production.
  - `VITE_API_URL` (frontend) – overrides default `/api/v1`.
  - `DATABASE_URL` (backend) – overrides default local Postgres URL.
- **CORS** – FastAPI allows origins from `ALLOWED_ORIGINS` env var; update for production domains.
- **Alembic version table** is `alembic_version`; never rename it.
- **Pre‑commit hooks** – run `pre-commit install` after cloning to enforce lint/format on every commit.

---

## One‑liner cheat sheet (copy‑paste)

```bash
# Backend
python -m venv .venv && source .venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env
createdb b2p_db
cd backend && alembic upgrade head && uvicorn app.main:app --reload

# Frontend
cd frontend && npm install && cp .env.example .env && npm run dev

# Docker (all services)
docker compose up -d   # start stack
docker compose down      # stop & clean

# Pre-commit
pre-commit install
```

---

## Sprint 2 Setup

After Sprint 1 is configured, run Sprint 2 migrations:

```bash
cd backend
alembic upgrade head
```

Sprint 2 adds: business_profiles, promoter_profiles, portfolio_items, social_links tables.
