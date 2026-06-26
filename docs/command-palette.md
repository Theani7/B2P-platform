# Universal Command Palette Architecture

## 1. Overview
The Universal Command Palette (PH-2.10) provides a fast, keyboard-first navigation and execution interface for Byparsathy, integrating seamlessly with the Global Search API.

## 2. Keyboard Shortcuts
- `Cmd + K` or `Ctrl + K`: Opens the command palette globally.
- `Arrow Up` / `Arrow Down`: Navigates through list items.
- `Enter`: Executes the focused command or navigates to the selected search result.
- `Escape`: Closes the modal.

## 3. Reuse Strategy
The Command Palette leverages the existing `/api/v1/search` REST API built in PH-2.9. No new backend endpoints were created.
- Search logic, database indexing, and ranking are preserved.
- Local Storage is utilized exclusively for `byparsathy_recent_pages` (Recent Pages) and `byparsathy_recent_commands` (Recent Commands).

## 4. Implemented Commands
- Navigation to all primary dashboards and settings pages.
- Action commands: Create Campaign, Open Marketplace, Logout.
- Contextual search integration based on role authorization.

## 5. Future Enhancements
- Action commands that can open nested modals (e.g., Quick Add User).
- Context-aware commands depending on the active page (e.g., "Archive this Campaign" when viewing a campaign detail page).
- Command chaining and multi-step dialogs.
