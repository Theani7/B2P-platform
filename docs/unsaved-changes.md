# Unsaved Changes Guard Architecture

## 1. Overview
The Unsaved Changes Guard (PH-2.13) prevents users from accidentally losing data on long forms (like Campaign Creation, Profile Settings, and Portfolio Editors) due to errant clicks or browser refreshes.

## 2. Global Integration
Because `react-router-dom` v6 `<BrowserRouter>` removed the native `<Prompt />` component, we implemented a global event-interception approach:
1. `UnsavedChangesContext.tsx` mounts near the top of the app tree (inside `main.tsx`).
2. It hooks into standard browser `beforeunload` events to block hard refreshes and tab closures.
3. It intercepts native internal routing clicks (`<a href>`) passively capturing them. If a dirty state exists, it prevents the default navigation and launches a beautiful, accessible warning dialog.

## 3. Usage with React Hook Form
The `useUnsavedChanges` hook can natively ingest a React Hook Form object:
```tsx
const methods = useForm();
useUnsavedChanges(methods); // Automatically marks dirty/clean based on methods.formState.isDirty
```

## 4. Manual Usage
```tsx
const { markDirty, markClean } = useUnsavedChanges();

const handleChange = () => {
    markDirty();
}
```

## 5. Security & Side Effects
The context automatically resets `isDirty` when the component unmounts, guaranteeing that the user isn't permanently locked into a dirty state if they successfully traverse beyond the route after a successful save.
