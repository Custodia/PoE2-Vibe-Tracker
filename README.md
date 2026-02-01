# PoE2 Campaign Progress Tracker

A browser-based campaign progress tracker for Path of Exile 2. Check off tasks as you complete them, reorder areas via drag-and-drop, and pick up where you left off — all progress is saved to localStorage.

## Features

- **Act tabs** with per-act progress bars and completion indicators
- **Task checkboxes** with type badges (Quest, Waypoint, Skill Point, Trial)
- **Drag-and-drop area reordering** with prerequisite validation — areas can only be placed after their dependencies
- **localStorage persistence** — completion state and custom area order survive page reloads
- **Reset button** to clear all progress and restore default order

## Tech Stack

- React 18 + Vite
- Tailwind CSS v4
- zustand (state management)
- @dnd-kit (drag-and-drop)

## Getting Started

```sh
nvm use           # uses Node 22 from .nvmrc
npm install
npm run dev
```

## Project Structure

```
src/
  data/campaign.json          # Campaign data (acts, areas, tasks)
  stores/useCampaignStore.js  # Zustand store with localStorage persistence
  components/
    App.jsx                   # Root layout, header, reset button
    ActTabs.jsx               # Tab bar for switching between acts
    ActPanel.jsx              # Sortable area list with progress bar
    AreaCard.jsx              # Draggable area card with task list
    TaskItem.jsx              # Checkbox + task name + type badge
  utils/reorderValidation.js  # Prerequisite validation for drag reorder
```

## Customizing Campaign Data

Edit `src/data/campaign.json` to add or modify acts, areas, and tasks. Each area can declare `prerequisites` — an array of area IDs that must appear earlier in the list.

Task types used for badge styling: `quest`, `waypoint`, `skill_point`, `trial`.
