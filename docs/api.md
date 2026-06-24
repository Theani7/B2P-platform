# API Documentation

Base URL: `/api/v1`

## Auth

| Method | Endpoint | Auth | Body | Success |
|--------|----------|------|------|---------|
| POST | `/auth/register` | No | `{username, full_name, email, password, role}` | `201` → `{access_token, refresh_token}` |
| POST | `/auth/login` | No | `{email, password}` | `200` → tokens |
| POST | `/auth/logout` | Yes | – | `200` |
| POST | `/auth/refresh` | No | `{refresh_token}` | `200` → tokens |
| POST | `/auth/verify-email` | No | `{token}` | `200` |
| POST | `/auth/forgot-password` | No | `{email}` | `200` |
| POST | `/auth/reset-password` | No | `{token, new_password}` | `200` |
| GET | `/auth/me` | Yes | – | `200` → user |
| PATCH | `/auth/me` | Yes | `{full_name?, email?}` | `200` → user |

### Role-protected examples

- `GET /auth/admin/debug` → ADMIN only
- `GET /auth/business/reports` → BUSINESS only
- `GET /auth/promoter/campaigns` → PROMOTER only

## Standard response envelope

Success:
```json
{ "success": true, "data": {}, "message": "" }
```

Error:
```json
{ "success": false, "message": "", "errors": [] }
```

## Authentication flow

1. Register or login to receive `access_token` (30 min) and `refresh_token` (7 days).
2. Include `Authorization: Bearer <access_token>` in requests.
3. When access token expires, call `/auth/refresh` with the refresh token.
4. Refresh tokens are rotated: old token is invalidated, new pair is issued.
5. Logout revokes the active refresh token.
