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
- **Tailwind design system** (`tailwind.config.ts`): colours – `primary:#2563EB`, `success:#16A34A`, `danger:#DC2626`, `background:#F8FAFC`, `text:#0F172A`. Use these keys (`bg-primary`, `text-danger`, etc.) for consistency.
- **Form validation**: All forms use **React Hook Form** + **Zod**; errors are rendered with `text-danger`. Do not rely on native HTML `required` attributes.
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

**Keep this file up‑to‑date** whenever new scripts, env vars, or workflow steps are introduced. It is the single source of truth for agents to avoid missing non‑obvious commands or configuration quirks.
