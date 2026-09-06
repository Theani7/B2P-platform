# Verification PDF Document Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the capability for promoters and businesses to optionally attach verification PDF documents when requesting profile verification, and allow administrators to inspect and download these documents in the admin portal.

**Architecture:** Extend the Prisma `VerificationRequest` model with `documentUrl` and `documentName`. Add a document upload endpoint (`POST /upload/document`) supporting PDFs up to 10MB. Build a modern `VerificationRequestModal` on the frontend with drag-and-drop PDF selection and integrate it into both promoter and business profile pages. Update the admin verification portal to display and preview attached documents.

**Tech Stack:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Multer, Next.js 15 (App Router), React 19, Tailwind CSS.

## Global Constraints
- Commit after each task using Conventional Commits and push to `origin/main`.
- Design tokens must strictly follow `DESIGN.md`.
- File upload must validate PDF files with a 10MB limit and store them safely under `uploads/documents/`.
- Document attachment is optional; requests without documents must continue to succeed.

---

### Task 1: Backend Database Schema, Upload Endpoint, and Verification Service Updates

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/src/modules/upload/controller.ts`
- Modify: `backend/src/modules/upload/routes.ts`
- Modify: `backend/src/modules/upload/service.ts`
- Modify: `backend/src/modules/verification/validation.ts`
- Modify: `backend/src/modules/verification/service.ts`
- Modify: `backend/src/modules/verification/controller.ts`

**Interfaces:**
- Produces:
  - Database fields `documentUrl String? @map("document_url") @db.Text` and `documentName String? @map("document_name") @db.Text` on `VerificationRequest`.
  - Endpoint `POST /upload/document` accepting single `file` (multipart/form-data, PDF up to 10MB) returning `{ success: true, data: { url: string } }`.
  - Endpoints `POST /business/verification-request` and `POST /promoter/verification-request` accepting `{ documentUrl?: string, documentName?: string }`.
  - Admin `listRequests` returning `documentUrl` / `document_url` and `documentName` / `document_name`.

- [ ] **Step 1: Update `backend/prisma/schema.prisma` and push DB changes**

Add to `model VerificationRequest`:
```prisma
  documentUrl       String?            @map("document_url") @db.Text
  documentName      String?            @map("document_name") @db.Text
```
Run:
```bash
cd backend && bunx prisma db push && bunx prisma generate
```

- [ ] **Step 2: Add document upload support in upload module**

In `backend/src/modules/upload/service.ts`, ensure `documents` subfolder is supported in `urlFor`:
```ts
case "documents":
  return `/uploads/documents/${filename}`;
```
In `backend/src/modules/upload/controller.ts`:
```ts
export const uploadDocument = handle("documents");
```
In `backend/src/modules/upload/routes.ts`:
Update multer limit to 10MB:
```ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
```
Add route:
```ts
router.post("/document", upload.single("file"), controllers.uploadDocument);
```

- [ ] **Step 3: Update verification validation, controller, and service**

In `backend/src/modules/verification/validation.ts`:
```ts
export const submitVerificationSchema = z.object({
  documentUrl: z.string().max(1000).optional(),
  documentName: z.string().max(255).optional(),
});
```
In `backend/src/modules/verification/controller.ts`:
Pass `req.body` to `submitBusiness` and `submitPromoter`.
In `backend/src/modules/verification/service.ts`:
Update `submit({ profileId, key, alreadyVerified, req, userId, documentUrl, documentName })` to save `documentUrl` and `documentName` into `prisma.verificationRequest.create`.
Update `listRequests` to return `documentUrl` and `documentName` (mapped to `document_url` and `document_name` for legacy compatibility).

- [ ] **Step 4: Run typecheck on backend**

Run:
```bash
cd backend && bunx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 5: Commit changes**

Run:
```bash
git add backend/prisma/schema.prisma backend/src/modules/upload/ backend/src/modules/verification/
git commit -m "feat(backend): add verification document upload endpoint and schema support"
```

---

### Task 2: Frontend Verification Request Modal & Profile Page Integration

**Files:**
- Create: `frontend/components/verification/VerificationRequestModal.tsx`
- Modify: `frontend/features/profile/api.ts`
- Modify: `frontend/app/(app)/promoter/profile/page.tsx`
- Modify: `frontend/app/(app)/business/profile/page.tsx`

**Interfaces:**
- Produces:
  - Component `VerificationRequestModal`:
    - Props: `{ open: boolean; onClose: () => void; role: "PROMOTER" | "BUSINESS"; onSuccess: () => void }`.
    - Features: File drag & drop, accepts `.pdf`, max 10MB, display filename & size, remove button, upload progress, optional document submission.
  - Profile pages trigger `VerificationRequestModal` when clicking "Request Verification".

- [ ] **Step 1: Create `frontend/components/verification/VerificationRequestModal.tsx`**

Implement modal with drag & drop PDF selector, validation, upload to `/api/v1/upload/document`, and submission to `/${role.toLowerCase()}/verification-request`.

- [ ] **Step 2: Update `frontend/features/profile/api.ts`**

Update `useRequestBusinessVerification` or verification submission functions to accept optional `{ documentUrl?: string; documentName?: string }`.

- [ ] **Step 3: Connect modal to Promoter Profile (`frontend/app/(app)/promoter/profile/page.tsx`)**

Add state `isVerificationModalOpen`.
Clicking "Request Verification" opens `VerificationRequestModal`.
On success, invalidate queries and update `pendingVerification`.

- [ ] **Step 4: Connect modal to Business Profile (`frontend/app/(app)/business/profile/page.tsx`)**

Add state `isVerificationModalOpen`.
Clicking "Request Verification" opens `VerificationRequestModal`.
On success, invalidate queries.

- [ ] **Step 5: Run typecheck on frontend**

Run:
```bash
cd frontend && bunx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 6: Commit changes**

Run:
```bash
git add frontend/components/verification/VerificationRequestModal.tsx frontend/features/profile/api.ts frontend/app/\(app\)/promoter/profile/page.tsx frontend/app/\(app\)/business/profile/page.tsx
git commit -m "feat(frontend): create VerificationRequestModal and connect to promoter and business profile pages"
```

---

### Task 3: Admin Verification Portal Updates to View/Download PDF

**Files:**
- Modify: `frontend/app/(app)/admin/verification/page.tsx`
- Modify: `frontend/features/admin/types.ts`

**Interfaces:**
- Consumes:
  - `req.document_url` / `req.documentUrl` and `req.document_name` / `req.documentName` from admin verification requests query.
- Produces:
  - Document preview badge / action in each verification card:
    - Displays "View Attached Document" with `FileText` and `ExternalLink` icons.
    - Opens the PDF document in a new tab.

- [ ] **Step 1: Update admin types in `frontend/features/admin/types.ts`**

Add optional `document_url?: string` and `document_name?: string` to `AdminVerificationRequest`.

- [ ] **Step 2: Update `frontend/app/(app)/admin/verification/page.tsx`**

In the request card under applicant details, render an attached document section:
```tsx
{docUrl && (
  <div className="mt-3 pt-3 border-t border-slate-custom/10 flex items-center justify-between">
    <div className="flex items-center gap-2 text-xs text-graphite font-medium">
      <FileText size={15} className="text-signal-blue" />
      <span className="truncate max-w-[150px]">{req.document_name || "Verification Document.pdf"}</span>
    </div>
    <a
      href={docUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs font-semibold text-signal-blue hover:underline"
    >
      View PDF <ExternalLink size={12} />
    </a>
  </div>
)}
```

- [ ] **Step 3: Run typecheck on frontend**

Run:
```bash
cd frontend && bunx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 4: Commit changes**

Run:
```bash
git add frontend/app/\(app\)/admin/verification/page.tsx frontend/features/admin/types.ts
git commit -m "feat(frontend): display attached verification documents in admin portal"
```

---

### Task 4: End-to-End Verification, Push to GitHub, and Server Validation

**Files:**
- None (verification and git push)

- [ ] **Step 1: Run comprehensive typechecks across frontend and backend**

Run:
```bash
cd frontend && bunx tsc --noEmit && cd ../backend && bunx tsc --noEmit
```
Expected: Both pass with 0 errors.

- [ ] **Step 2: Verify live local server health**

Run:
```bash
curl -I http://localhost:3000
curl -I http://localhost:8000/health
```
Expected: Both return 200 OK.

- [ ] **Step 3: Push commits to GitHub**

Run:
```bash
git push origin main
```
Expected: Successfully pushed to GitHub `origin/main`.
