# Design Specification: Verification Document (PDF) Upload & Admin Review

- **Date:** 2026-09-06
- **Status:** Approved
- **Topic:** Allow promoters and businesses to optionally attach verification PDF documents when requesting profile verification, with full admin review capabilities.

---

## 1. Problem Statement
Promoters and businesses currently request verification with a single click without the ability to attach supporting documents (such as government-issued IDs, citizenship certificates, company registration documents, or PAN/VAT certificates). Platform admins have to review requests without attached identity documentation.

This feature enables:
1. Promoters and businesses to optionally attach a PDF document when submitting a verification request.
2. Admins to view and inspect the attached PDF document directly from the Admin Verification portal.

---

## 2. Backend Architecture

### 2.1 Database Schema (`backend/prisma/schema.prisma`)
Update `model VerificationRequest`:
```prisma
model VerificationRequest {
  id                String             @id @default(uuid()) @db.Uuid
  promoterProfileId String?            @map("promoter_profile_id") @db.Uuid
  businessProfileId String?            @map("business_profile_id") @db.Uuid
  documentUrl       String?            @map("document_url") @db.Text
  documentName      String?            @map("document_name") @db.Text
  status            VerificationStatus @default(PENDING)
  submittedAt       DateTime           @default(now()) @map("submitted_at") @db.Timestamptz
  reviewedAt        DateTime?          @map("reviewed_at") @db.Timestamptz
  reviewedBy        String?            @map("reviewed_by") @db.Uuid
  adminNotes        String?            @map("admin_notes") @db.Text
  ...
}
```

### 2.2 Upload Module (`backend/src/modules/upload/`)
- Add endpoint `POST /upload/document` with multer memoryStorage handling files up to 10MB.
- Ensure allowed extensions include `.pdf`.
- Save files under `uploads/documents/` and return `{ url: "/uploads/documents/<uuid>.pdf" }`.

### 2.3 Verification Module (`backend/src/modules/verification/`)
- **Validation**:
  - `submitVerificationSchema`: `{ documentUrl: z.string().max(1000).optional(), documentName: z.string().max(255).optional() }`.
- **Service (`service.ts`)**:
  - `submitBusiness(user, body, req)` and `submitPromoter(user, body, req)` receive optional `documentUrl` and `documentName` and persist them to the database.
  - `listRequests(params)` formats response items to include `document_url` / `documentUrl` and `document_name` / `documentName`.

---

## 3. Frontend Architecture

### 3.1 Verification Request Modal (`frontend/components/verification/VerificationRequestModal.tsx`)
- Reusable modal dialog with:
  - Heading: "Request Verification".
  - Explanation: "Submit your profile for verification. You can optionally attach supporting PDF documents (Citizenship, PAN/VAT, or Registration Certificate) to expedite review."
  - PDF File Dropzone / Picker:
    - Accepts `.pdf` (max 10MB).
    - Drag & drop support.
    - Selected file indicator showing filename, file size, and remove button.
  - Action buttons: "Cancel" and "Submit Request".
  - Handles upload to `/api/v1/upload/document` first, then posts to `/api/v1/promoter/verification-request` or `/api/v1/business/verification-request`.

### 3.2 Integration into Profile Pages
- **Promoter Profile** (`frontend/app/(app)/promoter/profile/page.tsx`):
  - Clicking "Request Verification" opens `VerificationRequestModal` (role: `PROMOTER`).
- **Business Profile** (`frontend/app/(app)/business/profile/page.tsx`):
  - Clicking "Request Verification" opens `VerificationRequestModal` (role: `BUSINESS`).

### 3.3 Admin Verification Portal (`frontend/app/(app)/admin/verification/page.tsx`)
- Inside each verification request card:
  - If `req.document_url` or `req.documentUrl` exists:
    - Display an interactive "View Attached PDF" button with `FileText` and `ExternalLink` icons.
    - Opens document in a new tab: `${BACKEND_URL}${documentUrl}` (or direct `/uploads/...` URL rewritten by Next.js).

---

## 4. Verification & Testing
1. **Schema sync**: `bunx prisma db push && bunx prisma generate` runs cleanly.
2. **Type checks**: Both frontend and backend `bunx tsc --noEmit` pass with 0 errors.
3. **Upload validation**:
   - Upload non-PDF returns 400.
   - Upload valid PDF returns 201 with `{ url: "/uploads/documents/..." }`.
4. **Submission flow**:
   - Submitting without PDF creates `VerificationRequest` with null `documentUrl`.
   - Submitting with PDF creates `VerificationRequest` with valid `documentUrl` and `documentName`.
5. **Admin inspection**:
   - Admin view displays the PDF link and opens the PDF cleanly.
