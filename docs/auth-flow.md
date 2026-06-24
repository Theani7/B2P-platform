# Authentication Flow

## Registration

1. Client sends `POST /api/v1/auth/register` with username, email, password, role.
2. Server validates input, hashes password, generates verification token.
3. User record created with `is_verified=false`.
4. Verification email sent (logged in dev).
5. Server returns access + refresh tokens.

## Login

1. Client sends `POST /api/v1/auth/login` with email + password.
2. Server checks failed attempts; if locked, returns 403.
3. Verifies password; on success resets failed attempts and records `last_login_at`.
4. Returns new token pair.

## Token Refresh

1. Client sends `POST /api/v1/auth/refresh` with refresh token.
2. Server checks blacklist; if revoked, returns 401.
3. Validates token claims (`iss`, `aud`, `sub`, `type=refresh`).
4. Issues new token pair and revokes old refresh token.
5. Returns new tokens.

## Logout

1. Client sends `POST /api/v1/auth/logout`.
2. Server invalidates the refresh token by adding it to the blacklist.
3. Client discards stored tokens.

## Password Reset

1. Client sends `POST /api/v1/auth/forgot-password` with email.
2. Server generates one-time reset token and emails it.
3. Client sends `POST /api/v1/auth/reset-password` with token + new password.
4. Server validates token expiry, updates password hash, clears token.

## Email Verification

1. Client clicks link containing token.
2. Client sends `POST /api/v1/auth/verify-email` with token.
3. Server marks `is_verified=true` and clears token fields.
