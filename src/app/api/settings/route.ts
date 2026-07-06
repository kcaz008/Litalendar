import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getOrCreateAppSettings, getDisplayUrl } from "@/lib/db/display";
import bcrypt from "bcryptjs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getOrCreateAppSettings(session.userId);
  const displays = await prisma.display.findMany({
    where: { userId: session.userId },
  });

  return NextResponse.json({
    settings,
    displays: displays.map((d) => ({
      ...d,
      url: getDisplayUrl(d.slug, d.privateKey),
    })),
  });
}

export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const settings = await prisma.appSettings.upsert({
    where: { userId: session.userId },
    create: {
      userId: session.userId,
      calendarTitle: body.calendarTitle ?? "Family Calendar",
      autoRefreshMins: body.autoRefreshMins ?? 5,
      reloadHours: body.reloadHours ?? 6,
      requirePinDelete: body.requirePinDelete ?? false,
    },
    update: {
      ...(body.calendarTitle !== undefined ? { calendarTitle: body.calendarTitle } : {}),
      ...(body.autoRefreshMins !== undefined ? { autoRefreshMins: body.autoRefreshMins } : {}),
      ...(body.reloadHours !== undefined ? { reloadHours: body.reloadHours } : {}),
      ...(body.requirePinDelete !== undefined ? { requirePinDelete: body.requirePinDelete } : {}),
    },
  });

  if (body.displayId) {
    const displayUpdate: Record<string, unknown> = {};
    if (body.displayName) displayUpdate.name = body.displayName;
    if (typeof body.editingEnabled === "boolean") displayUpdate.editingEnabled = body.editingEnabled;
    if (body.regenerateKey) {
      const { generatePrivateKey } = await import("@/lib/db/display");
      displayUpdate.privateKey = generatePrivateKey();
    }
    if (body.deletePin !== undefined) {
      displayUpdate.deletePinHash =
        body.deletePin && body.deletePin.length > 0
          ? await bcrypt.hash(body.deletePin, 10)
          : null;
    }

    if (Object.keys(displayUpdate).length > 0) {
      await prisma.display.updateMany({
        where: { id: body.displayId, userId: session.userId },
        data: displayUpdate,
      });
    }
  }

  const displays = await prisma.display.findMany({
    where: { userId: session.userId },
  });

  return NextResponse.json({
    settings,
    displays: displays.map((d) => ({
      ...d,
      url: getDisplayUrl(d.slug, d.privateKey),
    })),
  });
}
