import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import {
  listGoogleCalendars,
  syncCalendarSourcesFromGoogle,
} from "@/lib/google/calendar";
import { dbCalendarToSource } from "@/lib/db/display";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sources = await prisma.calendarSource.findMany({
    where: { googleConnection: { userId: session.userId } },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    calendars: sources.map(dbCalendarToSource),
    sources,
  });
}

export async function POST() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await syncCalendarSourcesFromGoogle(session.userId);
    const googleCalendars = await listGoogleCalendars(session.userId);

    const sources = await prisma.calendarSource.findMany({
      where: { googleConnection: { userId: session.userId } },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ sources, googleCalendars });
  } catch (err) {
    console.error("Calendar sync error:", err);
    const message = err instanceof Error ? err.message : "Sync failed";
    const needsReconnect = message.toLowerCase().includes("insufficient authentication scopes");

    // Return existing DB calendars when sync fails so UI stays usable
    const existingSources = await prisma.calendarSource.findMany({
      where: { googleConnection: { userId: session.userId } },
      orderBy: { name: "asc" },
    });

    if (existingSources.length > 0) {
      return NextResponse.json({
        sources: existingSources,
        warning: message,
        needsReconnect,
        reconnectUrl: "/api/auth/google?reconnect=1&returnTo=/setup",
      });
    }

    return NextResponse.json(
      {
        error: message,
        needsReconnect,
        reconnectUrl: "/api/auth/google?reconnect=1&returnTo=/setup",
      },
      { status: needsReconnect ? 403 : 500 }
    );
  }
}
