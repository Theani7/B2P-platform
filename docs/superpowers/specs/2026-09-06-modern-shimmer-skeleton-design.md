# Design Specification: Modern Thresholded Shimmer Skeleton Transitions

- **Date:** 2026-09-06
- **Status:** Approved
- **Topic:** Transition from top progress bar to a modern thresholded shimmer skeleton for page navigation

---

## 1. Problem Statement
Previously, page transitions in the B2P Next.js application used a top progress bar (`NavigationProgress.tsx`). The user requested replacing the top progress bar with a modern skeleton loading state that feels sleek, fluid, and native, avoiding visual jarring or whole-page flicker.

---

## 2. Architecture & State Management

### 2.1 Remove Top Progress Bar
- Disarm and remove `<NavigationProgress />` from `frontend/app/providers.tsx`.
- Keep link click interception cleanly isolated to `NavigationProvider.tsx`.

### 2.2 Navigation State Coordination (`PageShell.tsx` & `NavigationProvider.tsx`)
- `useNavigation` tracks `isNavigating`, which triggers optimistically on click with zero delay to keep the sidebar responsive.
- `PageShell` introduces a 100ms threshold for displaying the full skeleton:
  - If navigation completes in `< 100ms` (e.g. cached/prefetched routes), the page mounts directly without displaying the skeleton, avoiding micro-flash flicker.
  - If navigation takes `≥ 100ms`, `showSkeleton` transitions to `true`, rendering `AppLoadingSkeleton` with a subtle fade-in.
  - When pathname matches the destination or navigation completes, `showSkeleton` clears and renders the active page content.
- `<Suspense fallback={<AppLoadingSkeleton />}>` is preserved in `PageShell` and `app/(app)/loading.tsx` for streaming Next.js components.

---

## 3. Visual Design & Modern Shimmer Styling (`AppLoadingSkeleton.tsx`)

### 3.1 Keyframe & Tailwind Utilities
- Implement smooth shimmer gradient wave:
  - Gradient: `bg-gradient-to-r from-slate-custom/5 via-slate-custom/12 to-slate-custom/5`
  - Background size: `bg-[length:200%_100%]`
  - Animation: `animate-shimmer` with linear infinite progression.
- Configure `@keyframes shimmer` in `tailwind.config.ts` or component styles.

### 3.2 Component Structure
- **Header Skeleton**:
  - Title badge placeholder (`h-8 w-44 rounded-xl`).
  - Subtitle placeholder (`h-4 w-64 rounded-md`).
  - Action button placeholder (`h-10 w-32 rounded-xl`).
- **Metric Cards Grid**:
  - 4 responsive cards: `rounded-2xl bg-white border border-slate-custom/10 shadow-sm p-5`.
  - Icon pill + title + stat value with shimmer highlights.
- **Main Section Cards**:
  - Primary content card (`lg:col-span-2`) with header and 3 list rows.
  - Secondary summary card (`lg:col-span-1`) with header and quick stats.

---

## 4. Verification & Testing
1. **Static Checks**: `bunx tsc --noEmit` in `frontend/` passes with 0 errors.
2. **Fast Navigation**: Clicking between already-visited tabs responds instantly with sidebar active state and zero skeleton flicker.
3. **Cold Navigation**: Navigating to un-cached or heavier routes shows the sleek shimmer skeleton after 100ms until route chunks load.
4. **No Top Progress Bar**: Confirm no top blue progress bar renders on screen.

---

## 5. Deployment & Git Commits
- Commit using Conventional Commits: `feat(frontend): replace top progress bar with modern thresholded shimmer skeleton`.
- Push to GitHub `origin/main` immediately per repository rules.
