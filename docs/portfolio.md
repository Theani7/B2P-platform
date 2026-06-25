# Professional Portfolio Management System

## Overview

The Professional Portfolio Management System (PH-2.4) allows Promoters to showcase their past work, client collaborations, and content quality directly on their B2P Connect profiles. It replaces simple text fields with a dynamic grid layout of projects, rich metrics, and rich media items.

## Architecture

*   **Storage**: Images and Videos are stored locally on the server under `backend/uploads/portfolio/`.
*   **Database**:
    *   `portfolio_items`: The main container for a project (title, client, description, metrics, featured flag).
    *   `portfolio_media`: Multiple media attachments (images/videos) linked to a single portfolio item.
*   **Media Delivery**: Served statically via FastAPI's `StaticFiles` mounted at `/static`.

## API Endpoints

*   `GET /api/v1/portfolio/me`: Fetch the authenticated user's portfolio.
*   `GET /api/v1/portfolio/promoter/{id}`: Fetch a promoter's public portfolio.
*   `POST /api/v1/portfolio`: Create a new portfolio item.
*   `PUT /api/v1/portfolio/{id}`: Update an item.
*   `DELETE /api/v1/portfolio/{id}`: Delete an item and its media.
*   `POST /api/v1/portfolio/{id}/media`: Upload an image or video (max 10MB image, 100MB video).
*   `DELETE /api/v1/portfolio/media/{media_id}`: Remove a media attachment.

## Business Rules

*   **Featured Items**: A promoter can mark up to 3 projects as "Featured" which display prominently.
*   **Profile Completion Integration**: If a promoter adds at least 1 portfolio item, their Profile Completion Score recalculates to give them the assigned 20% completion weight for the Portfolio requirement.

## Future Enhancements

*   **Drag & Drop Reordering**: Adding an `order_index` allows manual curation of the grid.
*   **Cloud Storage**: By changing the `UploadService` in `upload.py`, local files can be effortlessly migrated to AWS S3 or Cloudinary without refactoring the routes or models.
*   **Video Processing**: An asynchronous task could generate thumbnails for uploaded videos using `ffmpeg`.
