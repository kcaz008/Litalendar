# Litalendar

A touch-first family calendar dashboard for Echo Show 15.

## Phase 2 — Touch editing (current)

Full touch editing with local React state and mock data. No backend yet.

### Touch interactions
- **Tap event** → large details modal (Edit / Delete / Close)
- **Add Event** → multi-step touch form with presets
- **Quick-add chips** → open Add Event with prefilled calendar/title/time
- **Drag event** → confirmation modal before saving move
- **Resize event** → confirmation modal before saving duration change
- **Edit form** → duration quick buttons (−15 / +15 / +30 / +1 hour)
- **Delete** → confirmation required
- **Undo toast** → 10-second undo after create/edit/move/resize/delete
- **Conflict warning** → overlap detection on same calendar

## Phase 1 — Display UI

Beautiful `/display/[displayId]` route with mock family calendar data.

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

- Phase 3: Setup/settings + database
- Phase 4: Google OAuth + calendar fetching
- Phase 5: Real Google Calendar CRUD
- Phase 6: Echo Show 15 Silk browser testing & refinement
