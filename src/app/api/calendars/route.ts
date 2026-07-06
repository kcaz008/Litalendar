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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
