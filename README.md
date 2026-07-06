# Litalendar

A touch-first family calendar dashboard for Echo Show 15.

## Phase 1 — Display UI (current)

Beautiful `/display/[displayId]` route with mock family calendar data. No backend, OAuth, or database yet.

### Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000/display/kitchen](http://localhost:3000/display/kitchen) for the Echo Show display view.

### Target device

- Echo Show 15 (1920×1080 landscape, Amazon Silk browser)
- Touch-first, large typography, dark glass dashboard aesthetic

### Tech stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- FullCalendar v6 (timegrid, daygrid, list, interaction)

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page with link to display |
| `/display/[displayId]` | Echo Show calendar dashboard |

### Coming in later phases

- Phase 2: Touch editing (tap, drag, add, edit, delete, undo)
- Phase 3: Setup/settings + database
- Phase 4: Google OAuth + calendar fetching
- Phase 5: Real Google Calendar CRUD
- Phase 6: Echo Show 15 Silk browser testing & refinement
