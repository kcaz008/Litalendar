import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  fetchGoogleEventsForUser,
  type NormalizedGoogleEvent,
} from "@/lib/google/calendar";
import {
  dbCalendarToSource,
  getEventFetchRange,
  googleEventToFamilyEvent,
  validateDisplayAccess,
  getDisplayUrl,
} from "@/lib/db/display";
import { getAppUrl } from "@/lib/google/oauth";
import type { ConnectionStatus } from "@/types/calendar";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      events: [],
      calendars: [],
      connectionStatus: "offline" as ConnectionStatus,
      lastUpdated: new Date().toISOString(),
      error: "database_not_configured",
      setupUrl: `${getAppUrl()}/setup`,
    });
  }

  const display = await validateDisplayAccess(slug, key);
  if (!display) {
    return NextResponse.json({ error: "Invalid display or key" }, { status: 401 });
  }

  const calendars = await prisma.calendarSource.findMany({
    where: {
      googleConnection: { userId: display.userId },
    },
    orderBy: { name: "asc" },
  });

  const enabledCalendars = calendars.filter((c) => c.enabled);
  const calendarMap = new Map(calendars.map((c) => [c.id, c]));

  let connectionStatus: ConnectionStatus = "connected";
  let events: NormalizedGoogleEvent[] = [];
  let errorMessage: string | undefined;

  const connection = await prisma.googleConnection.findUnique({
    where: { userId: display.userId },
  });

  if (!connection) {
    connectionStatus = "auth_error";
    errorMessage = "Google account not connected";
  } else if (enabledCalendars.length === 0) {
    connectionStatus = "auth_error";
    errorMessage = "No calendars selected";
  } else {
    try {
      const { timeMin, timeMax } = getEventFetchRange();
      events = await fetchGoogleEventsForUser(display.userId, timeMin, timeMax);
    } catch (err) {
      console.error("Fetch events error:", err);
      connectionStatus = "auth_error";
      errorMessage = err instanceof Error ? err.message : "Failed to fetch events";
    }
  }

  const settings = await prisma.appSettings.findUnique({
    where: { userId: display.userId },
  });

  const familyEvents = events.map(googleEventToFamilyEvent);

  return NextResponse.json({
    events: familyEvents,
    calendars: enabledCalendars.map(dbCalendarToSource),
    allCalendars: calendars,
    connectionStatus,
    lastUpdated: new Date().toISOString(),
    error: errorMessage,
    setupUrl: getDisplayUrl(display.slug, display.privateKey),
    settings: {
      title: settings?.calendarTitle ?? display.name,
      editingEnabled: display.editingEnabled,
      autoRefreshMins: settings?.autoRefreshMins ?? 5,
      reloadHours: settings?.reloadHours ?? 6,
    },
    calendarNameMap: Object.fromEntries(
      [...calendarMap.entries()].map(([id, cal]) => [id, cal.name])
    ),
  });
}
