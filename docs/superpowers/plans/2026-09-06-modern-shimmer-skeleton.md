# Modern Shimmer Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the top navigation progress bar with a modern thresholded shimmer skeleton for page transitions in the B2P Next.js application.

**Architecture:** Remove the top navigation progress bar from the client provider tree. Add a 100ms thresholded transition state in `PageShell` so rapid route switches (< 100ms) transition instantly without any skeleton flash, while slower route loads smoothly display a sleek, modern wave-shimmer skeleton aligned with B2P's design tokens.

**Tech Stack:** Next.js 15 (App Router), React 19, Tailwind CSS v3, TypeScript.

## Global Constraints
- Commit after each task using Conventional Commits and push to `origin/main`.
- Design tokens must strictly follow `DESIGN.md` (colors: `slate-custom`, `linen-canvas`, `signal-blue`; border radii: `rounded-2xl`, `rounded-xl`).
- No full-page white flicker or jarring layout shifts.

---

### Task 1: Configure Tailwind Shimmer Animation and Update Modern Skeleton Component

**Files:**
- Modify: `frontend/tailwind.config.ts`
- Modify: `frontend/components/common/AppLoadingSkeleton.tsx`

**Interfaces:**
- Produces:
  - Tailwind animation `animate-shimmer` with `shimmer` keyframe: `0% { backgroundPosition: "-200% 0" }`, `100% { backgroundPosition: "200% 0" }`.
  - Exported `AppLoadingSkeleton` and `default` component displaying header placeholder, 4-card metric grid, and main/aside content cards with modern shimmer gradient.

- [ ] **Step 1: Add shimmer keyframes and animation in `tailwind.config.ts`**

Edit `frontend/tailwind.config.ts` to include under `theme.extend`:
```ts
keyframes: {
  shimmer: {
    "0%": { backgroundPosition: "-200% 0" },
    "100%": { backgroundPosition: "200% 0" },
  },
},
animation: {
  shimmer: "shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
},
```

- [ ] **Step 2: Update `frontend/components/common/AppLoadingSkeleton.tsx` with modern shimmer layout**

Replace pulse with wave shimmer styling:
```tsx
export function AppLoadingSkeleton() {
  const shimmer = "bg-gradient-to-r from-slate-custom/5 via-slate-custom/12 to-slate-custom/5 bg-[length:200%_100%] animate-shimmer";

  return (
    <div className="w-full space-y-6 p-2 sm:p-4 transition-opacity duration-200 ease-out">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-custom/10">
        <div className="space-y-2.5">
          <div className={`h-8 w-44 rounded-xl ${shimmer}`} />
          <div className={`h-4 w-64 max-w-full rounded-md ${shimmer}`} />
        </div>
        <div className={`h-10 w-32 rounded-xl ${shimmer}`} />
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className={`h-4 w-20 rounded ${shimmer}`} />
              <div className={`h-8 w-8 rounded-xl ${shimmer}`} />
            </div>
            <div className={`h-7 w-28 rounded-lg ${shimmer}`} />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-4">
          <div className={`h-6 w-40 rounded-md ${shimmer}`} />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-16 rounded-xl border border-slate-custom/5 ${shimmer}`} />
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-slate-custom/10 shadow-sm space-y-4">
          <div className={`h-6 w-32 rounded-md ${shimmer}`} />
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-12 rounded-xl border border-slate-custom/5 ${shimmer}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLoadingSkeleton;
```

- [ ] **Step 3: Run TypeScript compiler check**

Run:
```bash
cd frontend && bunx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 4: Commit changes**

Run:
```bash
git add frontend/tailwind.config.ts frontend/components/common/AppLoadingSkeleton.tsx
git commit -m "feat(frontend): add modern shimmer animation and skeleton layout"
```

---

### Task 2: Remove Top Progress Bar and Implement Thresholded Skeleton in PageShell

**Files:**
- Modify: `frontend/app/providers.tsx`
- Modify: `frontend/components/layout/PageShell.tsx`

**Interfaces:**
- Consumes:
  - `useNavigation` hook (`isNavigating`).
  - `AppLoadingSkeleton`.
- Produces:
  - Clean `Providers` component without `NavigationProgress`.
  - `PageShell` component with 100ms threshold timer preventing micro-flashes on fast navigations.

- [ ] **Step 1: Remove `<NavigationProgress />` from `frontend/app/providers.tsx`**

Remove the import of `NavigationProgress` and its JSX element from `frontend/app/providers.tsx`.

- [ ] **Step 2: Add 100ms thresholded transition in `frontend/components/layout/PageShell.tsx`**

Update `frontend/components/layout/PageShell.tsx`:
```tsx
"use client";

import { type ReactNode, Suspense, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { TopHeader } from "./TopHeader";
import { useNavigation } from "@/providers/NavigationProvider";
import { AppLoadingSkeleton } from "@/components/common/AppLoadingSkeleton";

interface PageShellProps {
  role: string;
  children: ReactNode;
}

export function PageShell({ role, children }: PageShellProps) {
  const { isNavigating } = useNavigation();
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    if (!isNavigating) {
      setShowSkeleton(false);
      return;
    }

    // Only display the skeleton if navigation takes longer than 100ms
    // to prevent rapid jarring flashes on cached/instant transitions.
    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isNavigating]);

  return (
    <div className="min-h-screen bg-linen-canvas flex">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {showSkeleton ? (
            <AppLoadingSkeleton />
          ) : (
            <Suspense fallback={<AppLoadingSkeleton />}>
              {children}
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run TypeScript compiler check**

Run:
```bash
cd frontend && bunx tsc --noEmit
```
Expected: 0 errors.

- [ ] **Step 4: Commit changes**

Run:
```bash
git add frontend/app/providers.tsx frontend/components/layout/PageShell.tsx
git commit -m "feat(frontend): replace top progress bar with thresholded shimmer skeleton in PageShell"
```

---

### Task 3: Verification, Push, and User Validation

**Files:**
- None (verification and git push)

- [ ] **Step 1: Run typechecks across both frontend and backend**

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
