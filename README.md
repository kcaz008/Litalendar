# Litalendar

A touch-first family calendar dashboard for Echo Show 15.

## Phases 3–4 — Setup + Google Calendar (current)

Connect Google Calendar, pick which calendars to show (yours, your wife's shared calendars, etc.), and display real events on the Echo Show.

### Setup flow

1. Deploy to Vercel with environment variables (see below)
2. Run database migration: `npx prisma db push`
3. Open **/setup** on phone/laptop
4. Sign in with Google
5. Select calendars to display
6. Copy the Echo Show link and open it in Silk browser

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string (Neon, Supabase, or Vercel Postgres) |
| `APP_URL` | Your app URL, e.g. `https://litalendar.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google Cloud OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google Cloud OAuth client secret |
| `SESSION_SECRET` | Random 32+ character string |

**Google Cloud setup:**
1. Create a project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Google Calendar API**
3. Create **OAuth 2.0 Web** credentials
4. Authorized redirect URI: `{APP_URL}/api/auth/google/callback`
5. OAuth scope used: `https://www.googleapis.com/auth/calendar.events`

### Routes

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/login` | Google sign-in |
| `/setup` | Connect Google, pick calendars, get Echo link |
| `/settings` | Calendar colors, display title, PIN, editing |
| `/display/[slug]?key=...` | Echo Show dashboard (live Google events) |
| `/display/kitchen` | Demo mode with mock data (no key) |

### What's included

- **Phase 3:** Postgres database (Prisma), User/GoogleConnection/CalendarSource/Display models, setup & settings pages
- **Phase 4:** Google OAuth (server-side tokens), calendar list sync, event fetching, auto-refresh, localStorage cache
- Google tokens never exposed to the browser
- Display secured with private `?key=` parameter

### Not yet implemented (Phase 5)

- Saving edits back to Google Calendar (create/update/delete API calls)
- Touch edits on live display are local until refresh

## Quick start (local)

```bash
npm install
cp .env.example .env.local
# Fill in env vars, then:
npx prisma db push
npm run dev
```

Open http://localhost:3000/setup

## Tech stack

- Next.js 15 App Router + React + TypeScript
- Tailwind CSS + FullCalendar v6
- Prisma + PostgreSQL
- Google Calendar API (googleapis)
