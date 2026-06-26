# Byparsathy - Deployment Guide

## 1. Environment Preparation
Ensure you have the following installed on your target server:
- Docker Engine & Docker Compose
- PostgreSQL 15+
- Node.js 18+ (For Frontend Build)

## 2. Environment Variables
Create a `.env` file in the root backend directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/byparsathy_db
SECRET_KEY=your_secure_random_string
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
ALLOWED_ORIGINS=https://yourdomain.com
RATE_LIMIT_AUTH=5
```

## 3. Database Migrations
Always run migrations against the production database before starting the application:
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

## 4. Building the Frontend
Build the Vite React app for production:
```bash
cd frontend
npm install
npm run build
```
Serve the generated `dist` folder using NGINX or deploy to Vercel/Cloudflare Pages.

## 5. Starting the Backend Server
Use Uvicorn with multiple workers for production traffic:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 6. Background Processes
(Optional) If you implement Celery for email scheduling or report generation in the future, start the worker:
```bash
celery -A app.core.celery_app worker --loglevel=info
```
