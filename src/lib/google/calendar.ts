import { google } from "googleapis";
import type { calendar_v3 } from "googleapis";
import { prisma } from "@/lib/db/prisma";
import { DISPLAY_TIMEZONE } from "@/lib/datetime/timezone";
import { refreshAccessToken } from "@/lib/google/oauth";

export interface GoogleCalendarListItem {
  id: string;
  summary: string;
  backgroundColor?: string | null;
  foregroundColor?: string | null;
  primary?: boolean | null;
  accessRole?: string | null;
}

async function getValidAccessToken(userId: string): Promise<string> {
  const connection = await prisma.googleConnection.findUnique({
    where: { userId },
  });

  if (!connection) {
    throw new Error("Google account not connected");
  }

  const now = new Date();
  const expiresAt = connection.expiresAt;
  const needsRefresh = !expiresAt || expiresAt.getTime() - now.getTime() < 60_000;

  if (!needsRefresh) {
    return connection.accessToken;
  }

  if (!connection.refreshToken) {
    throw new Error("Google auth expired — please reconnect");
  }

  const tokens = await refreshAccessToken(connection.refreshToken);
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

  await prisma.googleConnection.update({
    where: { userId },
    data: {
      accessToken: tokens.access_token,
      expiresAt: newExpiresAt,
      scope: tokens.scope,
    },
  });

  return tokens.access_token;
}

function getCalendarClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.calendar({ version: "v3", auth });
}

export async function listGoogleCalendars(userId: string): Promise<GoogleCalendarListItem[]> {
  const accessToken = await getValidAccessToken(userId);
  const calendar = getCalendarClient(accessToken);

  const res = await calendar.calendarList.list({ maxResults: 250 });
  const items = res.data.items ?? [];

  return items
    .filter((item) => item.id && item.summary)
    .map((item) => ({
      id: item.id!,
      summary: item.summary!,
      backgroundColor: item.backgroundColor,
      foregroundColor: item.foregroundColor,
      primary: item.primary,
      accessRole: item.accessRole,
    }));
}

export interface NormalizedGoogleEvent {
  id: string;
  googleEventId: string;
  googleCalendarId: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  calendarId: string;
  location?: string;
  notes?: string;
  recurringEventId?: string;
}

function parseGoogleDate(
  dateTime?: string | null,
  date?: string | null
): { iso: string; allDay: boolean } {
  if (dateTime) {
    return { iso: new Date(dateTime).toISOString(), allDay: false };
  }
  if (date) {
    // Keep YYYY-MM-DD for all-day events (FullCalendar + timezone-safe)
    return { iso: date, allDay: true };
  }
  return { iso: new Date().toISOString(), allDay: false };
}

function normalizeEvent(
  event: calendar_v3.Schema$Event,
  googleCalendarId: string,
  calendarSourceId: string
): NormalizedGoogleEvent | null {
  if (!event.id || !event.summary) return null;

  const start = parseGoogleDate(event.start?.dateTime, event.start?.date);
  const end = parseGoogleDate(event.end?.dateTime, event.end?.date);

  return {
    id: `${googleCalendarId}:${event.id}`,
    googleEventId: event.id,
    googleCalendarId,
    title: event.summary,
    start: start.iso,
    end: end.iso,
    allDay: start.allDay,
    calendarId: calendarSourceId,
    location: event.location ?? undefined,
    notes: event.description ?? undefined,
    recurringEventId: event.recurringEventId ?? undefined,
  };
}

export async function fetchGoogleEventsForUser(
  userId: string,
  timeMin: Date,
  timeMax: Date
): Promise<NormalizedGoogleEvent[]> {
  const sources = await prisma.calendarSource.findMany({
    where: {
      enabled: true,
      googleConnection: { userId },
    },
  });

  if (sources.length === 0) return [];

  const accessToken = await getValidAccessToken(userId);
  const calendar = getCalendarClient(accessToken);
  const allEvents: NormalizedGoogleEvent[] = [];

  await Promise.all(
    sources.map(async (source) => {
      try {
        const res = await calendar.events.list({
          calendarId: source.googleCalendarId,
          timeMin: timeMin.toISOString(),
          timeMax: timeMax.toISOString(),
          timeZone: DISPLAY_TIMEZONE,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 500,
        });

        for (const event of res.data.items ?? []) {
          const normalized = normalizeEvent(event, source.googleCalendarId, source.id);
          if (normalized) allEvents.push(normalized);
        }
      } catch (err) {
        console.error(`Failed to fetch calendar ${source.googleCalendarId}:`, err);
      }
    })
  );

  return allEvents.sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}

export async function syncCalendarSourcesFromGoogle(userId: string): Promise<void> {
  const connection = await prisma.googleConnection.findUnique({ where: { userId } });
  if (!connection) throw new Error("Google not connected");

  const googleCalendars = await listGoogleCalendars(userId);
  const existing = await prisma.calendarSource.findMany({
    where: { googleConnectionId: connection.id },
  });

  const existingIds = new Set(existing.map((e) => e.googleCalendarId));

  for (const gcal of googleCalendars) {
    if (existingIds.has(gcal.id)) continue;

    const colorIndex = existing.length % 8;
    const { GOOGLE_CALENDAR_COLORS } = await import("@/lib/google/oauth");
    const colors = GOOGLE_CALENDAR_COLORS[colorIndex];

    await prisma.calendarSource.create({
      data: {
        googleConnectionId: connection.id,
        googleCalendarId: gcal.id,
        name: gcal.summary,
        backgroundColor: gcal.backgroundColor ?? colors.bg,
        borderColor: colors.border,
        color: gcal.foregroundColor ?? "#ffffff",
        enabled: Boolean(gcal.primary),
      },
    });
  }
}
