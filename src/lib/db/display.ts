import { randomBytes } from "crypto";
import type { CalendarSource as DBCalendarSource, Display, AppSettings } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { CalendarSource, FamilyEvent } from "@/types/calendar";
import type { NormalizedGoogleEvent } from "@/lib/google/calendar";
import {
  addZonedDays,
  DISPLAY_TIMEZONE,
  endOfZonedDay,
  startOfZonedDay,
} from "@/lib/datetime/timezone";

export function generatePrivateKey(): string {
  return randomBytes(24).toString("base64url");
}

export function generateDisplaySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "display";
}

export async function getOrCreateDefaultDisplay(userId: string): Promise<Display> {
  const existing = await prisma.display.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  let slug = "kitchen";
  const slugTaken = await prisma.display.findUnique({ where: { slug } });
  if (slugTaken) slug = `kitchen-${randomBytes(3).toString("hex")}`;

  return prisma.display.create({
    data: {
      userId,
      slug,
      name: "Kitchen Display",
      privateKey: generatePrivateKey(),
      editingEnabled: true,
    },
  });
}

export async function getOrCreateAppSettings(userId: string): Promise<AppSettings> {
  return prisma.appSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

export async function validateDisplayAccess(
  slug: string,
  key: string | null | undefined
): Promise<(Display & { userId: string }) | null> {
  if (!key) return null;

  const display = await prisma.display.findUnique({ where: { slug } });
  if (!display || display.privateKey !== key) return null;

  return display;
}

export function dbCalendarToSource(cal: DBCalendarSource): CalendarSource {
  return {
    id: cal.id,
    name: cal.name,
    color: cal.color,
    backgroundColor: cal.backgroundColor,
    borderColor: cal.borderColor,
  };
}

export function googleEventToFamilyEvent(event: NormalizedGoogleEvent): FamilyEvent {
  return {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    calendarId: event.calendarId,
    location: event.location,
    notes: event.notes,
  };
}

export function getEventFetchRange(timeZone: string = DISPLAY_TIMEZONE): {
  timeMin: Date;
  timeMax: Date;
} {
  const now = new Date();
  const timeMin = startOfZonedDay(addZonedDays(now, -14, timeZone), timeZone);
  const timeMax = endOfZonedDay(addZonedDays(now, 60, timeZone), timeZone);
  return { timeMin, timeMax };
}

export function getDisplayUrl(slug: string, privateKey: string): string {
  const base = process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return `${base}/display/${slug}?key=${privateKey}`;
}
