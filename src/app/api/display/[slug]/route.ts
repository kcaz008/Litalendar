import { NextResponse } from "next/server";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getDisplayUrl } from "@/lib/db/display";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  const display = await prisma.display.findUnique({
    where: { slug },
    include: {
      user: {
        include: {
          appSettings: true,
          googleConnection: { select: { id: true } },
          displays: false,
        },
      },
    },
  });

  if (!display || display.privateKey !== key) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const calendars = await prisma.calendarSource.findMany({
    where: {
      enabled: true,
      googleConnection: { userId: display.userId },
    },
  });

  return NextResponse.json({
    display: {
      id: display.id,
      slug: display.slug,
      name: display.name,
      editingEnabled: display.editingEnabled,
      hasGoogle: Boolean(display.user.googleConnection),
    },
    settings: {
      title: display.user.appSettings?.calendarTitle ?? "Family Calendar",
      autoRefreshMins: display.user.appSettings?.autoRefreshMins ?? 5,
      reloadHours: display.user.appSettings?.reloadHours ?? 6,
      requirePinDelete: display.user.appSettings?.requirePinDelete ?? false,
    },
    calendars: calendars.map((c) => ({
      id: c.id,
      name: c.name,
      color: c.color,
      backgroundColor: c.backgroundColor,
      borderColor: c.borderColor,
    })),
    setupUrl: getDisplayUrl(display.slug, display.privateKey),
  });
}
