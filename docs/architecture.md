# Architecture

Byparsathy follows a **Clean Architecture** approach on the backend and a **Feature-Sliced** layout on the frontend.

## Backend layers

1. **API routes** – thin controllers delegating to services.
2. **Services** – use-case/business logic.
3. **Models** – SQLAlchemy ORM entities.
4. **Schemas** – Pydantic DTOs.
5. **Dependencies** – reusable FastAPI dependencies (auth, DB session).
6. **Middleware** – security headers, rate limiting.
7. **Utils** – email, token helpers.
8. **Exceptions** – global error handling with envelope response.

## Frontend layers

1. **Pages** – route-level components.
2. **Layouts** – shared page wrappers.
3. **Features** – self-contained slices (auth).
4. **Components** – reusable UI primitives.
5. **Hooks** – custom hooks (toast, auth checks).
6. **Services** – API client and interceptors.
7. **Providers** – React context for auth.
8. **Constants** – shared enums and config.

## Data flow

- Frontend stores access token in memory via context, refresh token in `localStorage`.
- Axios interceptor handles 401 → refresh → retry automatically.
- Backend issues short-lived access tokens and rotating refresh tokens stored in DB blacklist.
