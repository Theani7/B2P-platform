# Social Links & Creator Identity

## Overview
The **Social Links & Creator Identity** module (PH-2.5) provides a structured and professional way for Businesses and Promoters to link their external platforms (Instagram, TikTok, YouTube, Website, etc.) to their B2P Connect profiles. It replaces simple unstructured text fields with a robust system that validates URLs, prevents duplicates, and tracks followers and verification status.

## Supported Platforms
- **Instagram** (`https://instagram.com/...`)
- **TikTok** (`https://tiktok.com/...`)
- **YouTube** (`https://youtube.com/...`)
- **X** / Twitter (`https://x.com/...` or `twitter.com`)
- **LinkedIn** (`https://linkedin.com/...`)
- **Facebook** (`https://facebook.com/...`)
- **GitHub** (`https://github.com/...`)
- **Website** (Any valid HTTP/HTTPS URL)
- **Behance**, **Dribbble**

## Architecture

### Database Schema
The `social_links` table is linked directly to the `User` model, allowing both Business and Promoter users to manage their platforms identically.
- `id` (UUID)
- `user_id` (FK to `users.id`)
- `platform` (String enum)
- `username` (String)
- `url` (String, strictly validated)
- `followers_count` (Integer, nullable)
- `is_verified` (Boolean)
- `display_order` (Integer)

A unique constraint `uix_user_platform` ensures a user can only have one link per platform.

### API Endpoints
- `GET /api/v1/social/me`: Fetch authenticated user's links.
- `GET /api/v1/social/user/{user_id}`: Fetch any user's links publicly.
- `POST /api/v1/social`: Create a new link.
- `PUT /api/v1/social/{link_id}`: Update an existing link.
- `DELETE /api/v1/social/{link_id}`: Remove a link.
- `PUT /api/v1/social/reorder`: Reorder links via `display_order`.

## Validation Rules
URL validation is performed in `app.social.validators.validate_platform_url`. It enforces strict regex patterns ensuring users cannot spoof URLs (e.g., entering a YouTube link for the Instagram platform).

## Profile Completion Integration
The Profile Completion Engine (`app/profile_completion/calculations.py`) dynamically queries `user.social_links`. If a user successfully adds at least one validated social link, their profile score instantly increases by the allotted percentage (10% for Promoters, 5% for Businesses).

## Future Extension Points
- **OAuth Integration**: Future sprints can introduce direct OAuth 2.0 flows (e.g., "Sign in with Instagram") to automatically populate `followers_count` and `is_verified`.
- **Engagement Scraping**: A background task could periodically fetch the latest follower counts from public APIs to keep the profile fresh.
- **Portfolio Linking**: Portfolio Items could store a `social_link_id` to directly bridge a campaign back to the specific platform post.
