/** Default timezone for the kitchen Echo display (Eastern US). */
export const DISPLAY_TIMEZONE = "America/New_York";

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function getZonedParts(date: Date, timeZone: string = DISPLAY_TIMEZONE): ZonedParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/** Offset (ms) to add to UTC instant to get wall-clock components in `timeZone`. */
function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );
  return asUtc - date.getTime();
}

/** Wall-clock time in `timeZone` → UTC `Date`. */
export function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
  timeZone: string = DISPLAY_TIMEZONE
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
  const offset = getTimeZoneOffsetMs(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offset);
}

export function startOfZonedDay(date: Date = new Date(), timeZone: string = DISPLAY_TIMEZONE): Date {
  const { year, month, day } = getZonedParts(date, timeZone);
  return zonedDateTimeToUtc(year, month, day, 0, 0, 0, 0, timeZone);
}

export function endOfZonedDay(date: Date = new Date(), timeZone: string = DISPLAY_TIMEZONE): Date {
  const { year, month, day } = getZonedParts(date, timeZone);
  return zonedDateTimeToUtc(year, month, day, 23, 59, 59, 999, timeZone);
}

export function addZonedDays(
  date: Date,
  days: number,
  timeZone: string = DISPLAY_TIMEZONE
): Date {
  const { year, month, day } = getZonedParts(date, timeZone);
  const anchor = new Date(Date.UTC(year, month - 1, day + days, 12, 0, 0));
  const shifted = getZonedParts(anchor, timeZone);
  return zonedDateTimeToUtc(shifted.year, shifted.month, shifted.day, 12, 0, 0, 0, timeZone);
}

export function getDateKeyInTimezone(
  date: Date,
  timeZone: string = DISPLAY_TIMEZONE
): string {
  const { year, month, day } = getZonedParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function getTodayInTimezone(timeZone: string = DISPLAY_TIMEZONE): Date {
  return startOfZonedDay(new Date(), timeZone);
}

export function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

export function dateKeyToZonedStart(
  dateKey: string,
  timeZone: string = DISPLAY_TIMEZONE
): Date {
  const { year, month, day } = parseDateKey(dateKey);
  return zonedDateTimeToUtc(year, month, day, 0, 0, 0, 0, timeZone);
}

export function dateKeyToZonedEnd(
  dateKey: string,
  timeZone: string = DISPLAY_TIMEZONE
): Date {
  const { year, month, day } = parseDateKey(dateKey);
  return zonedDateTimeToUtc(year, month, day, 23, 59, 59, 999, timeZone);
}

/** Google Calendar all-day end dates are exclusive (YYYY-MM-DD). */
export function getExclusiveEndDateKey(end: string): string {
  return end.includes("T") ? getDateKeyInTimezone(new Date(end)) : end.slice(0, 10);
}

export function eventOverlapsZonedDay(
  event: { start: string; end: string; allDay?: boolean },
  day: Date,
  timeZone: string = DISPLAY_TIMEZONE
): boolean {
  const dayStart = startOfZonedDay(day, timeZone);
  const dayEnd = endOfZonedDay(day, timeZone);
  const dayKey = getDateKeyInTimezone(day, timeZone);

  if (event.allDay) {
    const startKey = event.start.slice(0, 10);
    const endKey = getExclusiveEndDateKey(event.end);
    return startKey <= dayKey && dayKey < endKey;
  }

  const eventStart = new Date(event.start);
  const eventEnd = new Date(event.end);
  return eventStart <= dayEnd && eventEnd >= dayStart;
}

export function formatZonedTime(
  date: Date,
  options: Intl.DateTimeFormatOptions,
  timeZone: string = DISPLAY_TIMEZONE
): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone }).format(date);
}
