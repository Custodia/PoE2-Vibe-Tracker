# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Path of Exile 2 campaign progress tracker — a React SPA where users check off tasks, reorder areas via drag-and-drop, and persist progress in localStorage. Deployed to GitHub Pages.

## Commands

```sh
nvm use           # Node 22 (from .nvmrc)
npm install       # install dependencies
npm run dev       # Vite dev server with HMR
npm run build     # production build to dist/
npm run preview   # preview production build locally
npm run lint      # ESLint on all .js/.jsx files
```

No test framework is configured.

## Architecture

**Data flow:** Static campaign data (`src/data/campaign.json`) defines a hierarchy of Acts → Areas → Tasks. A Zustand store (`src/stores/useCampaignStore.js`) holds runtime state (completed tasks as a Set, custom area ordering per act) and auto-persists to localStorage under key `poe2-campaign-progress`.

**Component tree:**
- `App` → header with reset button + `ActTabs` + `ActPanel`
- `ActTabs` — tab bar showing per-act progress; reads completedTasks from store
- `ActPanel` — wraps areas in `@dnd-kit` DndContext/SortableContext for drag-and-drop reordering
- `AreaCard` — draggable card per area; auto-collapses when all tasks complete; has "check all" button
- `TaskItem` — checkbox with type badge (quest/waypoint/skill_point/trial)

**Drag-and-drop constraint system:** Areas declare `prerequisites` (array of area IDs) in campaign.json. The `isValidOrder()` utility in `src/utils/reorderValidation.js` validates that all prerequisites appear before their dependents. Invalid reorders are silently reverted.

## Campaign Data Format

`src/data/campaign.json` structure:
```json
{ "acts": [{ "id": "act1", "name": "...", "areas": [
  { "id": "area_id", "name": "...", "prerequisites": ["other_area_id"],
    "tasks": [{ "id": "task_id", "name": "...", "type": "quest|waypoint|skill_point|trial" }]
  }
]}]}
```

## Key Conventions

- ES Modules throughout (`"type": "module"` in package.json)
- Tailwind CSS v4 (imported via `@tailwind` in index.css, configured through Vite plugin)
- Dark theme UI (`bg-gray-900`/`text-gray-100`)
- Vite base path is `'./'` for relative asset URLs (GitHub Pages compatibility)
- Deployment is automated via `.github/workflows/deploy.yml` on push to main
