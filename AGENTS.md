> **STACK: Next.js + Express (Node.js, JavaScript/ESM, Prisma + PostgreSQL)** on branch `convert/nextjs-express`. The conversion from FastAPI + React/Vite is **complete** (all backend Sprint 1–8 and frontend FS1–FS6 done). The "Backend specifics" / "Frontend specifics" sections below describe the **legacy FastAPI/React stack** and are kept for reference only. The authoritative conversion tracking is in the **[Backend Conversion Plan](#backend-conversion-plan-fastapi--nodeexpress)** section at the bottom of this file.

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
- **Tailwind design system** (`tailwind.config.ts`): **Use `DESIGN.md` as the single source of truth for all design tokens.** Colors, typography, spacing, border radius, and component specs are defined there. Key tokens:
  - Primary colors: `signal-blue` (#145aff), `linen-canvas` (#fcfcfc), `midnight-ink` (#020520)
  - Secondary colors: `sky-wash`, `graphite`, `slate`, `ash`, `fog`, `steel`
  - Fonts: Inter for UI/Headings (with aggressive negative tracking for displays), Roboto Mono for numbers.
  - Border Radii: `rounded-buttons` (12px) for CTAs, `rounded-pill` (50px/100px) for ghost buttons/nav, `rounded-cards` (8px), `rounded-cards-lg` (40px)
  - Shadows: Soft shadows allowed (e.g., `shadow-product-card`, `shadow-sm`, `shadow-xl`)
- **Form validation**: All forms use **React Hook Form** + **Zod**; errors rendered with `text-brand-coral` (not `text-danger`). No native HTML `required`.
- **Toasts**: Use `notifySuccess`, `notifyError` from `src/hooks/useToast.ts`.
- **Code splitting**: Routes use `React.lazy` + `Suspense` with `<LoadingSpinner />`.
- **Error handling**: Wrap app in `<ErrorBoundary>`.

---

## Common gotchas

- **Missing DB** → API returns 500; start PostgreSQL (`createdb b2p_db` or Docker) before backend.
- **Token expiration** → Access token expires after 30 min; Axios interceptor handles silent refresh if a valid refresh token exists.
- **Environment variables**:
  - `SECRET_KEY` (backend) – must be non-default for production.
  - `NEXT_PUBLIC_API_URL` (frontend) – backend API base URL (default `http://localhost:8000/api/v1`).
  - `DATABASE_URL` (backend) – Prisma Postgres connection string.
- **CORS** – Express allows origins from `ALLOWED_ORIGINS` env var; update for production domains.
- **Schema changes** – after editing `backend/prisma/schema.prisma`, run `bunx prisma db push && bunx prisma generate`. `db push` is a safe no-op when already in sync.

---

## One‑liner cheat sheet (copy‑paste)

```bash
# Install both workspaces (writes bun.lock)
bun install

# Set up DB schema (one-time / after schema changes)
cd backend && bunx prisma db push && bunx prisma generate && cd ..

# Run backend :8000 + frontend :3000 together
bun run dev
bun run dev:backend    # backend only
bun run dev:frontend   # frontend only
```


---

## Backend Conversion Plan (FastAPI → Node/Express)

**Branch:** `convert/nextjs-express`
**Stack:** Node.js + Express (JavaScript/ESM), Prisma + PostgreSQL, socket.io (chat), zod (validation), bcryptjs, jsonwebtoken.

### Module pattern (canonical — follow exactly)

Each feature module lives in `backend/src/modules/<name>/` with:
- `validation.js` — zod schemas (enums from `src/shared/enums.js`).
- `service.js` — business logic; reads `req.user` for identity; throws `AppError(msg, status, errors)`.
- `controller.js` — thin handlers calling `service`, returning `ok(res, data, message, status)`.
- `routes.js` — router; uses `authenticate`, `requireRole(ROLE.X)`, `validate(schema, source)`, and `wrap(fn)`.

Shared utilities (already ported, do NOT re-create):
- `src/shared/response.js` → `ok(res, data?, message?, status=200)`
- `src/shared/errors.js` → `AppError`, `errorHandler`, `notFoundHandler`
- `src/shared/validate.js` → `validate(schema, source="body")`
- `src/shared/auth.js` → `authenticate`, `requireRole`
- `src/shared/jwt.js`, `src/shared/enums.js` (`ROLE`), `src/config/env.js`, `src/config/db.js` (prisma), `utils/email.js`

Mount every router in `src/app.js` under `${config.apiV1}/<name>`.

### Verification checklist (run after every sprint)
- `cd backend && find src -name '*.js' -print0 | xargs -0 -I{} node --check {}` (syntax)
- Boot check: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/b2p_db" SECRET_KEY=test PORT=8011 node src/index.js` then curl `/health`, `/version`, and a protected route expecting `401`.
- Confirm new routes mount without crashing the app.

### Status legend
`✅ done/verified` · `🚧 in progress` · `⬜ not started`

### Sprint 1 — Auth + Profiles + Discovery  ✅ DONE
Modules: `auth`, `business`, `promoter`, `discovery` (+ `promoters` public router).
- Auth: register/login/logout/refresh/verify-email/forgot+reset-password/update-me, lockout, token rotation + blacklist.
- Business: profile CRUD, `/analytics`, saved-promoters (save/list/remove).
- Promoter: profile CRUD, `/analytics`.
- Discovery: `searchPromoters` (filters/sort/pagination), `getPublicProfile`, saved-promoter ops.
- `promoters` router: public `/:username`, BUSINESS-only `/` directory.
- **Verified:** all syntax OK; app boots; `/health`,`/version` OK; `/business/profile`,`/auth/me`,`/promoters` → 401; `/promoters/:username` reaches handler (Postgres running, proper envelope).

### Sprint 2 — Profile enrichment  ✅ DONE
Modules: `portfolio`, `social`, `profileCompletion`.
- `portfolio`: promoter portfolio items CRUD (create/list/update/delete), belongs to promoter profile.
- `social`: user social links CRUD (platform, url).
- `profileCompletion`: completion % scoring for business/promoter profiles.
- **Verified:** syntax OK; mounted in `app.js`; e2e (register→profile→portfolio create/list/update/delete, social create, completion 13%→38%, 401 no-token, 403 wrong-role) all pass. DB schema pushed via `prisma db push` (legacy `b2p_db` reset).

### Sprint 3 — Verification  ✅ DONE
Modules: `verification` (serves both `businessVerification` + `promoterVerification` + admin review).
- Self-service submit + list own requests: `POST/GET /business/verification-request` (BUSINESS), `POST/GET /promoter/verification-request` (PROMOTER). Guards against duplicate PENDING and already-verified.
- Admin review (ADMIN): `GET /verification-requests` (status filter + pagination), `POST /verification-requests/:id/approve`, `POST /verification-requests/:id/reject`. Approve flips `profile.verified = true` in a transaction; both write `audit_logs`.
- Mounted specific `/business/verification-request` & `/promoter/verification-request` BEFORE base `/business` & `/promoter` routers in `app.js`.
- **Verified:** syntax OK; e2e — submit (201), duplicate-pending (400), admin list, approve→verified=true, re-approve (400 processed), already-verified submit (400), reject with notes, 404 on unknown id, 403 cross-role gating, 4 audit rows written.

### Sprint 4 — Campaigns foundation  ✅ DONE
Modules: `campaign`, `applications`, `invitations` (+ shared `src/shared/notify.js`, `src/shared/collaboration.js`).
- `campaign` (BUSINESS): CRUD, `GET /campaigns/dashboard/stats`, status workflow `publish`/`unpublish`/`archive`/`reopen` with validated transitions (DRAFT→OPEN→ACTIVE→COMPLETED; ARCHIVE/CANCEL any). Delete cascades apps/invites/collabs/reviews/convos/messages/deliverables/saved in a transaction. zod date coercion + end≥start refinement.
- `applications`: promoter `POST /campaigns/:id/apply` (re-applies over WITHDRAWN, 409 on duplicate, requires campaign OPEN+PUBLIC), `DELETE /applications/:id` withdraw, `GET /promoter/applications`; business `GET /campaigns/:id/applications`, `GET /business/applications`, `POST /applications/:id/accept` (→ ACTIVE collaboration in tx, 201), `POST /applications/:id/reject`.
- `invitations`: business `POST /campaigns/:id/invite/:promoterId` (409 duplicate), `DELETE /invitations/:id` cancel, `GET /business/invitations`; promoter `GET /promoter/invitations`, `POST /invitations/:id/accept` (→ collaboration in tx, 201), `POST /invitations/:id/reject`. All actions write notifications via `notify.js` (non-blocking).
- **Routing note:** `applications` & `invitations` mount at api root with per-route role guards and are mounted BEFORE base `/campaigns`, `/business`, `/promoter` routers so their blanket role middleware doesn't capture these mixed-role paths.
- **Verified:** syntax OK; e2e — campaign create/publish, apply (400 pre-open, 201, 409 dup, 403 wrong-role), list applications, accept→ACTIVE collab, re-accept 400; invite 201/409, promoter+business invitation lists, accept→collab, re-accept 400; dashboard stats, status-filter list, invalid transition 400, date validation 422, cascade delete 200; notifications rows written.

### Sprint 5 — Collaboration & marketplace  ✅ DONE
Modules: `collaborations`, `marketplace`, `matching` (+ shared `notify.js` reused for match-ready notification).
- `collaborations`: BUSINESS `GET /business/collaborations` (status filter + pagination), `GET /business/collaborations/:id/deliverables`, `PATCH /business/collaborations/:id/deliverables/:deliverableId/review` (status + feedback, ownership-checked). PROMOTER `GET /promoter/collaborations`, `GET /promoter/collaborations/:id/deliverables`, `POST /promoter/collaborations/:id/deliverables` (status IN_REVIEW). Collaboration reads include campaign + partner info and `hasReview` flag (computed from `reviews`). Both sides verify collaboration ownership.
- `marketplace`: `GET /campaign-marketplace` (any authenticated user) — PUBLIC+OPEN campaigns, search (title/desc/category/location), category filter, sort (default created_at desc), pagination; promoter view also returns `hasApplied`/`isBookmarked`/`applicantCount`. `POST`/`DELETE /campaign-marketplace/:campaignId/bookmark` (PROMOTER only, toggles `savedCampaigns`).
- `matching`: BUSINESS `POST /campaigns/:campaignId/generate-matches` (rule-based scoring over all promoters: niche 40/related 20, location 20, followers up to 15, experience up to 10, engagement up to 15; upserts `matchResults`, writes CAMPAIGN_MATCH_READY notification) and `GET /campaigns/:campaignId/matches` (classification / minScore / verified filters, ordered by score desc, includes promoter + explanation).
- **Routing fix:** `matching` router was originally applying `requireRole(BUSINESS)` at the router level, but since it mounts at the API root (`app.use(apiV1, matchingRouter)`) that middleware ran for *every* `/api/v1/*` request (e.g. `/campaign-marketplace`) and rejected non-business callers before the correct router matched. Moved the role guard to per-route like `applications`/`invitations`. Mount order: matching + marketplace before base `/campaigns` router; collaborations before base `/business` & `/promoter` routers.
- **Verified:** syntax OK; e2e — marketplace list (401 no-token, lists OPEN+PUBLIC), bookmark 200 → isBookmarked true → remove 200, bookmark as BUSINESS 403; matching generate 7 results, list ordered by score, explanation text, minScore=80 filter, generate as PROMOTER 403; collaboration created via apply→accept, promoter submits deliverable IN_REVIEW, business lists 1, business reviews→APPROVED+feedback, business list collab partner+hasReview=false, promoter submits on unknown collab 404, promoter list collab 1. Boot: /health /version 200, protected routes 401.

### Sprint 6 — Reputation & activity  ✅ DONE
Modules: `reviews`, `achievements`, `activity` (+ achievement seeding in `index.js`, activity `record()` helper reused by achievements).
- `reviews` (any authenticated participant): `POST /collaborations/:id/complete` (ACTIVE→COMPLETED, participant-only, notifies other party), `POST /collaborations/:id/reviews` (only on COMPLETED collab, participant-only, reviewee = the *other* party's user, 409 on duplicate, notifies REVIEW_RECEIVED), `PUT/DELETE /reviews/:id` (author-only), `GET /my/reviews`, `GET /my/received-reviews`, `GET /users/:userId/reviews`, `GET /users/:userId/rating` (avg + 1–5 star distribution). Mounted at api root before base routers.
- `achievements`: `GET /achievements/` (catalog), `GET /achievements/me`, `GET /achievements/users/:userId/achievements` (merges all active defs with user progress + computed level/points curve), `POST /achievements/recalculate` (ADMIN). Rule engine (`rules.js`) awards COMPLETE_PROFILE / COMPLETE_BUSINESS_PROFILE / FIRST_SOCIAL_LINK / FIRST_PORTFOLIO; unlocking writes an activity log + SYSTEM notification. The 4 achievement definitions are seeded at startup via `seedAchievements()` (legacy never seeded them).
- `activity`: `GET /activity/me`, `GET /activity/business` (BUSINESS), `GET /activity/admin` (ADMIN); uses `size` (not `limit`) pagination param + returns `actorName`. `record()` is a non-throwing helper (like `notify.js`) used by achievements; available for other modules to log actions.
- **Decision/deviation:** the achievements catalog was public in legacy, but because every root-mounted router calls `router.use(authenticate)` at the `/api/v1` prefix, an earlier root router intercepts unauthenticated requests and 401s before the achievements router runs. Made the catalog require auth (consistent with the fully-authenticated API) rather than reorder mounts fragilely.
- **Known pre-existing issue (Sprints 4–6, not fixed):** several routers mount at the `/api/v1` root each with `router.use(authenticate)`, so an authenticated request handled by a later root router re-runs `authenticate` (and its user DB lookup) once per preceding root router. Functionally correct but redundant; candidate for a single app-level `authenticate` or path-scoped mounts later.
- **Verified:** syntax OK; e2e — review-before-complete 400, complete by non-participant 403, complete 200, re-complete 400, business↔promoter reviews resolve correct reviewee, duplicate 409, rating 6 → 422, update author-only (403 for others), my/received lists, rating summary avg+distribution, delete→rating recomputes to 0; achievements catalog=4, recalc ADMIN-only (403 for promoter), promoter earns COMPLETE_PROFILE+FIRST_SOCIAL_LINK (15 pts) after adding social link; activity me=2 unlocks, business/admin role gating 403, 401 no-token. Boot: /health /version 200, protected routes 401.

### Sprint 7 — Realtime & engagement  ✅ DONE
Modules: `notifications`, `chat`, `sharing` (+ `shared/socket.js`, socket wiring in `index.js`).
- `notifications`: `GET /notifications` (paginated, `unread_only`), `GET /notifications/unread-count`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`, `DELETE /notifications/:id`, `GET`/`PUT /notifications/preferences`. Realtime via socket.io — `shared/notify.js` now emits `NEW_NOTIFICATION` to the recipient's `user:<id>` room on every create.
- `chat` (REST): `GET /chat/conversations` (auto-creates a `Conversation` per collaboration, returns participants + `unreadCount` + `lastMessage` + campaign info, sorted by latest activity), `GET /chat/collaborations/:collaborationId/history`, `POST /chat/conversations/:conversationId/read` (marks other-party messages read), `PATCH`/`DELETE /chat/messages/:messageId` (sender-only; delete is soft). Realtime via socket.io (`modules/chat/socket.js`): `join_conversation` (participation-gated), `message` (persists, only when collaboration ACTIVE, broadcasts to `conversation:<id>` room + fires a `NEW_MESSAGE` notification to the other party), `typing_start`/`typing_stop`.
- `sharing`: `GET /sharing/profile` (role-aware shareable link — promoter → `/promoters/:username`, business → `/promoter/marketplace`) and `GET /sharing/campaign/:campaignId` (owner-only → `/campaign-marketplace/:id`). Uses `config.frontendUrl` (new env `FRONTEND_URL`).
- `shared/socket.js`: `initSocket(server)` creates the socket.io `Server` (CORS `*`), authenticates every connection via the access token, joins each socket to `user:<id>`. `index.js` now builds an `http.Server`, attaches socket.io, and calls `registerChatSocket(io)`.
- **Design notes / deviations:**
  - Realtime transport is **socket.io** (per AGENTS stack), not FastAPI WebSockets — both notifications and chat run over the single socket.io server.
  - `validate(schema, source)` was extended to support `source: "params"` (previously only `body`/`query`); the campaign-share route validates the path param this way.
  - `NotificationPreference` has no composite unique on `(userId, type)`, so `updatePreferences` does a find-then-create/update instead of a Prisma `upsert` (composite-unique `where` would 500).
  - A malformed (non-UUID) campaign id returns **400** (Prisma rejects invalid UUID) rather than 404; a valid-but-missing id returns 404.
- **Verified:** syntax OK; e2e — notifications list/unread-count/mark-one/mark-all/delete(404 on re-delete)/preferences GET+PUT; chat conversations auto-created, history empty→1 after socket message, unread count increments then clears on read, edit/delete are sender-only (403 cross-user), non-participant sees no conversations; realtime message + `NEW_MESSAGE` notification both delivered to the connected recipient over socket.io; sharing profile/campaign links (403 for non-owner, 404 for missing campaign); boot /health /version 200, protected routes 401.

### Sprint 8 — Platform ops  ✅ DONE
Modules: `admin`, `settings`, `upload`, `export`, `search`.
- `admin` (ADMIN): `/dashboard` stats, `/users` (list/detail/suspend/activate/delete, search+role+isActive filters), `/campaigns` (list/archive/cancel), `/reviews` (list/delete), `/audit-logs` (search/action/userId/date filters), `/settings` (list/seed/update/delete platform settings), `/analytics`. Every mutating action writes an `audit_logs` row. `seedSettings()` runs at startup (idempotent upsert) so `/settings` dropdowns are populated.
- `settings`: public `GET /settings` + authenticated `GET /settings/account` (user + profile + notification prefs); mounted before root routers so the unauthenticated `GET /settings` is served.
- `upload`: multer (memory, 5MB) → disk under `uploads/<subfolder>/`; `avatar`/`portfolio-image`/`chat-attachment` any authed user, `logo` BUSINESS-only (403 otherwise). Returns `/uploads/...` URL served by the static `/uploads` handler.
- `export`: authed `POST /export` { module: campaigns|promoters|profile, format: csv|json, columns? } → writes to `uploads/exports/` and returns downloadable `/uploads/exports/<file>` URL (verified downloadable). Role-scoped queries.
- `search`: authed `GET /search?q=&type=` across campaigns/promoters/businesses (+ users for ADMIN), scored/relevance-sorted, records `search_history` (capped at 10/user); `GET/DELETE /search/history`.
- **Verified:** syntax OK; e2e (41 checks) — admin gating (403 non-admin, 401 no-token), dashboard/analytics, user list/detail/suspend/activate/delete (+404 on re-delete, 400 suspend-admin), campaign list/archive/cancel (+404), review list/delete, audit-logs populated by suspend/activate, settings seed/get/update/delete (+404), public/account settings (+401 on account), upload avatar/portfolio/chat (201) + logo BUSINESS-only (403), export profile-json/campaigns-csv downloadable (+422 bad module), search all-types/history/clear (+422 missing q); boot /health /version 200, protected routes 401. Settings seeded at startup.

### Frontend Conversion Plan (FastAPI/React → Next.js + Express)  ⬜
**Stack:** Next.js 15 (App Router, TypeScript) + Tailwind v3 (DESIGN.md tokens) → Express/Prisma/Postgres. API calls hit `NEXT_PUBLIC_API_URL` (CORS already allows `localhost:3000`); tokens in `localStorage` with client-side route guards (matches legacy; middleware can't read localStorage). `next.config.mjs` rewrites `/api/v1/*` and `/uploads/*` to `BACKEND_URL`.

| Sprint | Scope | Status |
|---|---|---|
| **FS1** Foundation, Auth & Routing | Next.js scaffold, Tailwind (DESIGN.md), `apiClient` (axios + token/refresh interceptor), `AuthProvider`/`useAuth`/`useHasRole`, `RequireAuth`/`GuestOnly`, `AppLayout`/nav, ErrorBoundary, UI primitives; pages: landing (RoleRedirect), login, register, verify-email, forgot/reset-password, role dashboards (`/business`,`/promoter`,`/admin`/dashboard). | ✅ DONE |
| FS2 | Profiles & discovery (business/promoter CRUD, discovery, profile-completion, portfolio, social) | ✅ DONE |
| FS3 | Campaigns (create/list/detail, publish/archive, applications, invitations) | ✅ DONE |
| FS4 | Collaboration & marketplace (browse/bookmark, matching, collaborations+deliverables+reviews) | ✅ DONE |
| FS5 | Realtime & engagement (notifications UI + socket.io, chat UI, sharing links) | ✅ DONE |
| FS6 | Platform ops & dashboards (admin CRUD/moderation, settings, upload, export, search, analytics, achievements, activity) | ✅ DONE |

**FS1 Verified:** `npm run build` passes (12 routes, types OK); SSR returns 200 for `/`, `/login`, `/register`, `/business|promoter|admin/dashboard` (shell then client redirect), `/verify-email`; `POST /api/v1/auth/login` 200 through configured backend URL; no runtime errors. Login flow wired (setTokens → reload → RoleRedirect → dashboard).

**FS2 Verified:** `npm run build` passes (18 routes, types OK). New pages: `/business/profile`, `/business/promoters` (discovery directory + filters/sort/pagination + Save), `/business/saved-promoters` (list/remove), `/promoters/[username]` (public promoter profile w/ portfolio + social), `/promoter/profile`, `/promoter/portfolio` (CRUD + featured/platforms/tags), `/promoter/social` (CRUD), plus `ProfileCompletionWidget` on both dashboards. Role-gated via `RequireAuth`; nav updated per role; toasts via `react-hot-toast`. SSR returns 200 for all new routes; `npm run build` type-checks clean (production boot 534ms).

**FS3 Verified:** `npm run build` passes (24 routes, types OK). New API layers: `features/campaigns`, `features/applications`, `features/invitations` (camelCase types matching Express envelope). New pages: `/business/campaigns` (list + dashboard stats + status filter + pagination), `/business/campaigns/new` (create), `/business/campaigns/[id]` (detail: edit, publish/unpublish/archive/reopen gated by status, delete, applications accept/reject, invite-by-username + cancel), `/business/applications`, `/business/invitations`, `/promoter/applications` (list + withdraw), `/promoter/invitations` (accept/reject). Nav updated per role. End-to-end e2e against live backend (register→profile→campaign create OPEN→list→publish non-draft 400→apply 201→duplicate 409→business apps→accept 201→invite unknown promoter/campaign 404→promoter invitations 200) all pass; frontend field names match the Express responses.

**FS4 Verified:** `npm run build` passes (29 routes, types OK). New API layers: `features/marketplace`, `features/matching`, `features/collaborations`, `features/reviews` (camelCase types matching Express envelope). New pages: `/promoter/marketplace` (browse OPEN+PUBLIC campaigns, search/category filters, apply, bookmark toggle), `/promoter/collaborations` (list + status filter + submit deliverables + leave-review on COMPLETED), `/business/collaborations` (list + deliverable review APPROVED/REVISION_REQUESTED/PUBLISHED + complete + leave-review), `/business/campaigns/[id]/matches` (generate + scored list w/ classification/explanation + invite), `/business/reviews` + `/promoter/reviews` (rating summary + received/written tabs + delete). Shared `RatingStars` + `ReviewDialog` + `ReviewsView`. Nav updated per role. End-to-end e2e against live backend (22 checks): marketplace list/flags/bookmark toggle, generate-matches + match score/classification/explanation, apply→accept→collaboration visible to both, deliverable submit→APPROVED review reflected, complete collaboration, create review + duplicate 409, received/written review lists — all pass; frontend field names match the Express responses.

**FS5 Verified:** `npm run build` passes (33 routes, types OK). Installed `socket.io-client`. New `lib/socket.ts` (singleton socket + `useSocketEvent`). New API layers: `features/notifications`, `features/chat`, `features/sharing`. New UI: `NotificationBell` (real-time `NEW_NOTIFICATION` via socket, unread badge, mark-read/delete) wired into `AppLayout` header; `/notifications` page (list + mark-all + preferences toggles); `/messages` (conversation list + realtime chat: `join_conversation`, socket `message` broadcast, typing indicators, mark-read); `ShareDialog` wired on promoter/business profile + campaign detail (`/sharing/profile`, `/sharing/campaign/:id`). Nav updated (Messages link). End-to-end e2e against live backend (14 checks, socket.io in Node): sharing links resolve correctly, notification prefs/list/unread-count, conversation auto-created for an ACTIVE collaboration, both sockets join room, realtime `message` delivered to the other party + `NEW_MESSAGE` socket notification fired, message persisted in history, business unread count incremented then cleared on read — all pass. Fixed `useConversations` to unwrap the paginated `{items:[...]}` envelope.

**FS6 Verified:** `npm run build` passes (42 routes, types OK). New API layers: `features/achievements`, `features/activity`, `features/settings`, `features/upload`, `features/search`, `features/export`, `features/admin` (camelCase types matching the Express envelope). New pages/routes: `/achievements` (level/points + earned/locked badge grid + admin recalculate), `/activity` (role-aware: my/business/admin timeline), `/settings` (account + public platform settings + avatar upload for all, logo upload for BUSINESS via `UploadField`), `/search` (grouped results + recent-history chips + clear), `/export` (module/format select → downloadable `/uploads/exports/...` link), and the full admin console `/admin/{dashboard,users,users/[id],campaigns,reviews,audit-logs,settings,analytics}` (suspend/activate/delete users, archive/cancel campaigns, delete reviews, audit-log browser, platform-settings seed/update/delete, dashboard stats + analytics charts). Nav extended for all three roles (Activity, Export, Search, Settings, Achievements; ADMIN gets the full moderation console). End-to-end e2e against live backend (34 checks): achievements catalog/me + recalc ADMIN-only (403 for promoter), activity me/business/admin, public + account settings (401 unauth on account), search buckets + history clear + missing-q 422, export profile-json + campaigns-csv + promoters-csv downloadable + bad-module 422, admin dashboard/analytics, user suspend/activate/delete + re-delete 404, audit-logs populated by moderation, campaign/review lists, settings seed/update/delete + re-delete 404 — all pass.

**Cross-sprint fix (applies to FS1–FS6):** the backend wraps every response in `{ success, data, message }`, but `lib/apiClient.ts` previously returned the raw axios response, so query hooks doing `.then((r) => r.data)` received the envelope and components reading `data.items` got `undefined` (data lists were silently broken). Changed the `apiClient` response interceptor to return `r.data` (the envelope), so the established `.then((r) => r.data)` convention now yields the inner payload. Updated `login`/`register` in `features/auth/api.ts` to read `res.data.data.access_token` and the refresh interceptor to read `resp.data.data`. This makes all prior sprints' authenticated data rendering actually functional.

