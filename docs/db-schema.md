# Database Schema Documentation

## users

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| username | varchar(150) | unique, indexed |
| full_name | varchar(255) | |
| email | varchar(255) | unique, indexed |
| password_hash | varchar(255) | bcrypt |
| role | enum | BUSINESS/PROMOTER/ADMIN, indexed |
| is_active | boolean | default true |
| is_verified | boolean | default false |
| verification_token | varchar(255) | nullable |
| verification_token_expiry | timestamptz | nullable |
| failed_login_attempts | integer | default 0 |
| locked_until | timestamptz | nullable |
| last_login_at | timestamptz | nullable |
| created_at | timestamptz | default now() |
| updated_at | timestamptz | auto updated |

## revoked_refresh_tokens

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| token_hash | varchar(255) | unique, indexed |
| expires_at | timestamptz | |
| created_at | timestamptz | default now() |
