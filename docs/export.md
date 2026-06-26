# Export & Reporting Center Architecture

## 1. Overview
The Export & Reporting Center (PH-2.11) provides robust data extraction capabilities across Byparsathy, allowing Businesses and Promoters to download their datasets securely as CSV files. 

## 2. API Endpoints
- `POST /api/v1/export`: Receives an `ExportRequest` describing the module (e.g. `campaigns`, `promoters`), format, filters, and column definitions. Returns an `ExportResponse` pointing to a local static download URL (`/exports/filename.csv`).

## 3. Storage
Export files are generated dynamically inside `/backend/uploads/exports/`. The FastAPI app serves this directory via `StaticFiles(directory="uploads/exports")` mapped to `/exports`.

## 4. Security & Privacy
The `ExportService` strictly enforces role-based constraints. 
- A Business exporting `campaigns` only receives campaigns belonging to their profile.
- A Promoter exporting `campaigns` only receives publicly visible (`ACTIVE`) campaigns.

## 5. Future Enhancements
- Integrate `openpyxl` or `xlsxwriter` for complex Excel workbook exports.
- Implement PDF report generation (e.g. `pdfkit` or `WeasyPrint`) for Platform Analytics summaries.
- Add cron jobs for scheduled email delivery of reporting dashboards using Celery and Redis.
- Implement an automated cleanup script to delete files in `uploads/exports/` where `expires_at` has passed.
