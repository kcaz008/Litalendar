import type { CalendarSource, FamilyEvent } from "@/types/calendar";
import {
  addZonedDays,
  DISPLAY_TIMEZONE,
  eventOverlapsZonedDay,
  getZonedParts,
  startOfZonedDay,
  zonedDateTimeToUtc,
} from "@/lib/datetime/timezone";
import { getCalendarInitials } from "@/lib/display/agenda";

export {
  formatTime,
  formatTimeRange,
  formatDateLong,
} from "@/lib/events/utils";

export const MOCK_CALENDARS: CalendarSource[] = [
  {
    id: "family",
    name: "Family",
    color: "#ffffff",
    backgroundColor: "#5b8def",
    borderColor: "#4a7de0",
  },
  {
    id: "school",
    name: "School",
    color: "#ffffff",
    backgroundColor: "#a78bfa",
    borderColor: "#8b6fe8",
  },
  {
    id: "sports",
    name: "Sports",
    color: "#ffffff",
    backgroundColor: "#34d399",
    borderColor: "#22c58a",
  },
  {
    id: "work",
    name: "Work",
    color: "#ffffff",
    backgroundColor: "#f59e0b",
    borderColor: "#e08e00",
  },
  {
    id: "personal",
    name: "Personal",
    color: "#ffffff",
    backgroundColor: "#f472b6",
    borderColor: "#e85fa3",
  },
];

function getMondayOfWeek(date = new Date(), timeZone = DISPLAY_TIMEZONE): Date {
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
  }).format(date);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = dayMap[dayName] ?? 0;
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  return startOfZonedDay(addZonedDays(date, diff, timeZone), timeZone);
}

function atInTimezone(
  weekStart: Date,
  dayOffset: number,
  hour: number,
  minute = 0,
  timeZone = DISPLAY_TIMEZONE
): string {
  const day = addZonedDays(weekStart, dayOffset, timeZone);
  const { year, month, day: dom } = getZonedParts(day, timeZone);
  return zonedDateTimeToUtc(year, month, dom, hour, minute, 0, 0, timeZone).toISOString();
}

function duration(
  weekStart: Date,
  startDay: number,
  startHour: number,
  startMin: number,
  endDay: number,
  endHour: number,
  endMin: number
) {
  const start = atInTimezone(weekStart, startDay, startHour, startMin);
  const end = atInTimezone(weekStart, endDay, endHour, endMin);
  return { start, end };
}

/** Demo events for the current week — always generated at runtime. */
export function createMockEvents(referenceDate = new Date()): FamilyEvent[] {
  const weekStart = getMondayOfWeek(referenceDate);
  const todayOffset = (() => {
    const dayName = new Intl.DateTimeFormat("en-US", {
      timeZone: DISPLAY_TIMEZONE,
      weekday: "short",
    }).format(referenceDate);
    const dayMap: Record<string, number> = {
      Sun: 6,
      Mon: 0,
      Tue: 1,
      Wed: 2,
      Thu: 3,
      Fri: 4,
      Sat: 5,
    };
    return dayMap[dayName] ?? 0;
  })();

  return [
  // Monday
  {
    id: "1",
    title: "School Drop-off",
    calendarId: "school",
    location: "Lincoln Elementary",
    ...duration(weekStart, 0, 7, 30, 0, 8, 0),
  },
  {
    id: "2",
    title: "Team Standup",
    calendarId: "work",
    location: "Home Office",
    ...duration(weekStart,0, 9, 0, 0, 9, 30),
  },
  {
    id: "3",
    title: "Soccer Practice",
    calendarId: "sports",
    location: "Riverside Park Field 3",
    notes: "Bring water bottle and shin guards",
    ...duration(weekStart,0, 16, 0, 0, 17, 30),
  },
  {
    id: "4",
    title: "Family Dinner",
    calendarId: "family",
    location: "Home",
    ...duration(weekStart,0, 18, 30, 0, 20, 0),
  },

  // Tuesday
  {
    id: "5",
    title: "Dentist — Emma",
    calendarId: "personal",
    location: "Bright Smiles Dental",
    notes: "Annual checkup",
    ...duration(weekStart,1, 10, 0, 1, 11, 0),
  },
  {
    id: "6",
    title: "Piano Lesson",
    calendarId: "school",
    location: "Ms. Chen's Studio",
    ...duration(weekStart,1, 15, 30, 1, 16, 30),
  },
  {
    id: "7",
    title: "Grocery Run",
    calendarId: "family",
    location: "Whole Foods",
    ...duration(weekStart,1, 17, 0, 1, 18, 0),
  },

  // Wednesday
  {
    id: "8",
    title: "School Pickup",
    calendarId: "school",
    location: "Lincoln Elementary",
    ...duration(weekStart,2, 15, 0, 2, 15, 30),
  },
  {
    id: "9",
    title: "Swim Lessons",
    calendarId: "sports",
    location: "Community Pool",
    ...duration(weekStart,2, 16, 0, 2, 17, 0),
  },
  {
    id: "10",
    title: "Book Club",
    calendarId: "personal",
    location: "Living Room",
    notes: "Chapter 12 discussion",
    ...duration(weekStart,2, 19, 30, 2, 21, 0),
  },

  // Thursday
  {
    id: "11",
    title: "Parent-Teacher Conference",
    calendarId: "school",
    location: "Lincoln Elementary — Room 204",
    notes: "Mr. Johnson, 15 min slot",
    ...duration(weekStart,3, 14, 0, 3, 14, 30),
  },
  {
    id: "12",
    title: "Basketball Game",
    calendarId: "sports",
    location: "Westside Gym",
    notes: "Away game — arrive 30 min early",
    ...duration(weekStart,3, 17, 30, 3, 19, 30),
  },
  {
    id: "13",
    title: "Date Night",
    calendarId: "family",
    location: "Bella Italia",
    ...duration(weekStart,3, 19, 0, 3, 22, 0),
  },

  // Friday
  {
    id: "14",
    title: "School Assembly",
    calendarId: "school",
    location: "Lincoln Elementary Gym",
    ...duration(weekStart,4, 9, 0, 4, 10, 0),
  },
  {
    id: "15",
    title: "Work — Deep Focus",
    calendarId: "work",
    location: "Home Office",
    notes: "No meetings block",
    ...duration(weekStart,4, 10, 0, 4, 12, 0),
  },
  {
    id: "16",
    title: "Pizza & Movie Night",
    calendarId: "family",
    location: "Home",
    ...duration(weekStart,4, 18, 0, 4, 21, 0),
  },

  // Saturday
  {
    id: "17",
    title: "Soccer Tournament",
    calendarId: "sports",
    location: "Memorial Sports Complex",
    notes: "Bring chairs, sunscreen, snacks",
    ...duration(weekStart,5, 8, 0, 5, 14, 0),
  },
  {
    id: "18",
    title: "Birthday Party — Jake",
    calendarId: "family",
    location: "FunZone Arcade",
    ...duration(weekStart,5, 14, 30, 5, 17, 0),
  },
  {
    id: "19",
    title: "Farmers Market",
    calendarId: "family",
    location: "Downtown Square",
    ...duration(weekStart,5, 9, 0, 5, 10, 30),
  },

  // Sunday
  {
    id: "20",
    title: "Church",
    calendarId: "family",
    location: "St. Mary's",
    ...duration(weekStart,6, 10, 0, 6, 11, 30),
  },
  {
    id: "21",
    title: "Meal Prep",
    calendarId: "family",
    location: "Home",
    ...duration(weekStart,6, 14, 0, 6, 16, 0),
  },
  {
    id: "22",
    title: "Family Game Night",
    calendarId: "family",
    location: "Living Room",
    ...duration(weekStart,6, 18, 0, 6, 20, 30),
  },

  // Today-specific extras (will show in agenda)
  {
    id: "23",
    title: "Morning Coffee",
    calendarId: "personal",
    ...duration(weekStart, todayOffset, 6, 30, todayOffset, 7, 0),
  },
  ];
}

export const MOCK_DISPLAY = {
  title: "Family Calendar",
  connectionStatus: "connected" as const,
  editingEnabled: true,
};

export function getCalendarById(id: string, calendars: CalendarSource[] = MOCK_CALENDARS): CalendarSource | undefined {
  return calendars.find((c) => c.id === id);
}

export function enrichEvent(event: FamilyEvent, calendars: CalendarSource[] = MOCK_CALENDARS) {
  const cal = getCalendarById(event.calendarId, calendars);
  return {
    ...event,
    calendarName: cal?.name ?? "Unknown",
    calendarColor: cal?.backgroundColor ?? "#5b8def",
  };
}

export function toFullCalendarEvents(events: FamilyEvent[], calendars: CalendarSource[] = MOCK_CALENDARS) {
  return events.map((event) => {
    const cal = getCalendarById(event.calendarId, calendars);
    return {
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: event.allDay ?? false,
      backgroundColor: cal?.backgroundColor ?? "#5b8def",
      borderColor: cal?.borderColor ?? "#4a7de0",
      textColor: cal?.color ?? "#ffffff",
      extendedProps: {
        calendarId: event.calendarId,
        calendarName: cal?.name ?? "Unknown",
        calendarInitials: getCalendarInitials(cal?.name ?? "?"),
        location: event.location,
        notes: event.notes,
      },
    };
  });
}

export function getEventsForDay(
  events: FamilyEvent[],
  date: Date,
  timeZone: string = DISPLAY_TIMEZONE
): FamilyEvent[] {
  return events
    .filter((event) => eventOverlapsZonedDay(event, date, timeZone))
    .sort((a, b) => {
      const aStart = a.allDay ? a.start : new Date(a.start).toISOString();
      const bStart = b.allDay ? b.start : new Date(b.start).toISOString();
      return aStart.localeCompare(bStart);
    });
}

