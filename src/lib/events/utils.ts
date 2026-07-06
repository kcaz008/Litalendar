import type { FamilyEvent } from "@/types/calendar";

let idCounter = 1000;

export function generateEventId(): string {
  idCounter += 1;
  return `evt-${idCounter}`;
}

export function cloneEvents(events: FamilyEvent[]): FamilyEvent[] {
  return events.map((e) => ({ ...e }));
}

export function parseDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseTimeKey(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function combineDateAndTime(dateKey: string, timeKey: string): Date {
  const [y, mo, d] = dateKey.split("-").map(Number);
  const [h, mi] = timeKey.split(":").map(Number);
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}

export function toIso(date: Date): string {
  return date.toISOString();
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

export function getDurationMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
}

export function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTimeLong(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatTimeRange(start: string, end: string, allDay?: boolean): string {
  if (allDay) return "All day";
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatDuration(start: string, end: string, allDay?: boolean): string {
  if (allDay) return "All day";
  const mins = getDurationMinutes(start, end);
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (rem === 0) return hours === 1 ? "1 hour" : `${hours} hours`;
  return `${hours}h ${rem}m`;
}

export function eventsOverlap(a: FamilyEvent, b: FamilyEvent): boolean {
  if (a.calendarId !== b.calendarId) return false;
  if (a.id === b.id) return false;
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export function findConflicts(
  event: FamilyEvent,
  allEvents: FamilyEvent[],
  excludeId?: string
): FamilyEvent[] {
  return allEvents.filter(
    (e) => e.id !== excludeId && e.id !== event.id && eventsOverlap(event, e)
  );
}

export function eventFromForm(form: {
  id?: string;
  title: string;
  calendarId: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location?: string;
  notes?: string;
}): FamilyEvent {
  if (form.allDay) {
    const start = combineDateAndTime(form.date, "00:00");
    const end = addMinutes(combineDateAndTime(form.date, "23:59"), 1);
    return {
      id: form.id ?? generateEventId(),
      title: form.title.trim(),
      calendarId: form.calendarId,
      start: toIso(start),
      end: toIso(end),
      allDay: true,
      location: form.location?.trim() || undefined,
      notes: form.notes?.trim() || undefined,
    };
  }

  const start = combineDateAndTime(form.date, form.startTime);
  const end = combineDateAndTime(form.date, form.endTime);

  return {
    id: form.id ?? generateEventId(),
    title: form.title.trim(),
    calendarId: form.calendarId,
    start: toIso(start),
    end: toIso(end),
    allDay: false,
    location: form.location?.trim() || undefined,
    notes: form.notes?.trim() || undefined,
  };
}

export function formFromEvent(event: FamilyEvent) {
  return {
    id: event.id,
    title: event.title,
    calendarId: event.calendarId,
    date: parseDateKey(event.start),
    startTime: parseTimeKey(event.start),
    endTime: parseTimeKey(event.end),
    allDay: event.allDay ?? false,
    location: event.location ?? "",
    notes: event.notes ?? "",
  };
}

export function getTodayKey(): string {
  return parseDateKey(new Date().toISOString());
}

export function getTomorrowKey(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return parseDateKey(d.toISOString());
}

export function getWeekendKey(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSaturday = day === 6 ? 0 : day === 0 ? 6 : 6 - day;
  d.setDate(d.getDate() + daysUntilSaturday);
  return parseDateKey(d.toISOString());
}

export interface AddEventPrefill {
  title?: string;
  calendarId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  allDay?: boolean;
}

export function defaultAddForm(prefill?: AddEventPrefill) {
  const date = prefill?.date ?? getTodayKey();
  const startTime = prefill?.startTime ?? "09:00";
  let endTime = prefill?.endTime;

  if (!endTime && prefill?.durationMinutes) {
    const start = combineDateAndTime(date, startTime);
    endTime = parseTimeKey(toIso(addMinutes(start, prefill.durationMinutes)));
  }
  if (!endTime) {
    const start = combineDateAndTime(date, startTime);
    endTime = parseTimeKey(toIso(addMinutes(start, 60)));
  }

  return {
    title: prefill?.title ?? "",
    calendarId: prefill?.calendarId ?? "family",
    date,
    startTime,
    endTime,
    allDay: prefill?.allDay ?? false,
    location: "",
    notes: "",
  };
}

export const QUICK_ADD_PRESETS: {
  label: string;
  emoji: string;
  prefill: AddEventPrefill;
}[] = [
  { label: "School", emoji: "📚", prefill: { title: "School", calendarId: "school", startTime: "08:00", durationMinutes: 60 } },
  { label: "Soccer", emoji: "⚽", prefill: { title: "Soccer", calendarId: "sports", startTime: "16:00", durationMinutes: 90 } },
  { label: "Doctor", emoji: "🏥", prefill: { title: "Doctor", calendarId: "personal", startTime: "10:00", durationMinutes: 60 } },
  { label: "Dinner", emoji: "🍽️", prefill: { title: "Dinner", calendarId: "family", startTime: "18:00", durationMinutes: 90 } },
  { label: "Pickup", emoji: "🚗", prefill: { title: "Pickup", calendarId: "family", startTime: "15:00", durationMinutes: 30 } },
  { label: "Reminder", emoji: "🔔", prefill: { title: "Reminder", calendarId: "family", startTime: "12:00", durationMinutes: 15 } },
];

export const TITLE_PRESETS = [
  "School",
  "Soccer",
  "Doctor",
  "Dentist",
  "Birthday",
  "Dinner",
  "Pickup",
  "Dropoff",
  "Reminder",
  "Work",
  "Family",
];

export const DATE_PRESETS = [
  { label: "Today", getValue: getTodayKey },
  { label: "Tomorrow", getValue: getTomorrowKey },
  { label: "This weekend", getValue: getWeekendKey },
] as const;

export const TIME_PRESETS = [
  { label: "Morning", startTime: "09:00", endTime: "10:00" },
  { label: "Afternoon", startTime: "14:00", endTime: "15:00" },
  { label: "Evening", startTime: "18:00", endTime: "19:00" },
] as const;

export const DURATION_PRESETS = [
  { label: "15 min", minutes: 15 },
  { label: "30 min", minutes: 30 },
  { label: "1 hour", minutes: 60 },
  { label: "2 hours", minutes: 120 },
] as const;
