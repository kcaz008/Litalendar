import {
  DISPLAY_TIMEZONE,
  eventOverlapsZonedDay,
  getDateKeyInTimezone,
  getTodayInTimezone,
  startOfZonedDay,
} from "@/lib/datetime/timezone";
import type { CalendarSource, FamilyEvent } from "@/types/calendar";

export function getCalendarInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
}

function eventSortKey(event: FamilyEvent): string {
  if (event.allDay) return `${event.start.slice(0, 10)}T00:00:00`;
  return event.start;
}

export function sortEventsChronologically(events: FamilyEvent[]): FamilyEvent[] {
  return [...events].sort((a, b) => eventSortKey(a).localeCompare(eventSortKey(b)));
}

export function getEventsForDay(
  events: FamilyEvent[],
  day: Date,
  timeZone: string = DISPLAY_TIMEZONE
): FamilyEvent[] {
  return sortEventsChronologically(
    events.filter((event) => eventOverlapsZonedDay(event, day, timeZone))
  );
}

export function isEventActiveNow(event: FamilyEvent, now = new Date(), timeZone = DISPLAY_TIMEZONE): boolean {
  if (event.allDay) {
    return eventOverlapsZonedDay(event, now, timeZone);
  }
  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  const ts = now.getTime();
  return ts >= start && ts < end;
}

export function isEventUpcomingToday(
  event: FamilyEvent,
  now = new Date(),
  timeZone = DISPLAY_TIMEZONE
): boolean {
  if (!eventOverlapsZonedDay(event, now, timeZone)) return false;
  if (event.allDay) return true;
  return new Date(event.start).getTime() >= now.getTime();
}

export function getNextUpEvent(
  events: FamilyEvent[],
  now = new Date(),
  timeZone = DISPLAY_TIMEZONE
): FamilyEvent | null {
  const today = getTodayInTimezone(timeZone);
  const todayEvents = getEventsForDay(events, today, timeZone);

  const active = todayEvents.find((event) => isEventActiveNow(event, now, timeZone));
  if (active) return active;

  const upcoming = todayEvents.filter((event) => {
    if (event.allDay) return true;
    return new Date(event.start).getTime() > now.getTime();
  });

  if (upcoming.length === 0) return null;

  return upcoming.sort((a, b) => {
    if (a.allDay && !b.allDay) return -1;
    if (!a.allDay && b.allDay) return 1;
    return eventSortKey(a).localeCompare(eventSortKey(b));
  })[0];
}

export function getRemainingTodayEvents(
  events: FamilyEvent[],
  now = new Date(),
  timeZone = DISPLAY_TIMEZONE
): FamilyEvent[] {
  const today = getTodayInTimezone(timeZone);
  const todayEvents = getEventsForDay(events, today, timeZone);
  const nextUp = getNextUpEvent(events, now, timeZone);

  return todayEvents.filter((event) => {
    if (!nextUp) return true;
    if (event.id === nextUp.id) return false;
    if (event.allDay) return true;
    return new Date(event.start).getTime() > now.getTime();
  });
}

export function enrichEventWithCalendar(
  event: FamilyEvent,
  calendars: CalendarSource[]
): FamilyEvent & { calendarName: string; calendarColor: string; calendarInitials: string } {
  const cal = calendars.find((c) => c.id === event.calendarId);
  const name = cal?.name ?? "Unknown";
  return {
    ...event,
    calendarName: name,
    calendarColor: cal?.backgroundColor ?? "#5b8def",
    calendarInitials: getCalendarInitials(name),
  };
}

export function isEventInCurrentMonth(
  event: FamilyEvent,
  reference = new Date(),
  timeZone = DISPLAY_TIMEZONE
): boolean {
  const refKey = getDateKeyInTimezone(reference, timeZone).slice(0, 7);
  const startKey = event.allDay ? event.start.slice(0, 7) : getDateKeyInTimezone(new Date(event.start), timeZone).slice(0, 7);
  return startKey === refKey;
}

export function cacheEventsLookStale(
  events: FamilyEvent[],
  todayKey: string,
  timeZone = DISPLAY_TIMEZONE
): boolean {
  if (events.length === 0) return false;

  const hasCurrentMonthEvent = events.some((event) => isEventInCurrentMonth(event, new Date(), timeZone));
  if (!hasCurrentMonthEvent) return true;

  const monthStart = startOfZonedDay(new Date(), timeZone);
  const cutoffKey = getDateKeyInTimezone(
    new Date(monthStart.getTime() - 45 * 24 * 60 * 60 * 1000),
    timeZone
  );

  const allVeryOld = events.every((event) => {
    const key = event.allDay
      ? event.start.slice(0, 10)
      : getDateKeyInTimezone(new Date(event.start), timeZone);
    return key < cutoffKey;
  });

  return allVeryOld;
}
