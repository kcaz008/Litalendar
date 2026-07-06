import type { CalendarSource, FamilyEvent } from "@/types/calendar";

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

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function at(dayOffset: number, hour: number, minute = 0): string {
  const weekStart = startOfWeek(new Date());
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function duration(startDay: number, startHour: number, startMin: number, endDay: number, endHour: number, endMin: number) {
  const start = at(startDay, startHour, startMin);
  const end = at(endDay, endHour, endMin);
  return { start, end };
}

export const MOCK_EVENTS: FamilyEvent[] = [
  // Monday
  {
    id: "1",
    title: "School Drop-off",
    calendarId: "school",
    location: "Lincoln Elementary",
    ...duration(0, 7, 30, 0, 8, 0),
  },
  {
    id: "2",
    title: "Team Standup",
    calendarId: "work",
    location: "Home Office",
    ...duration(0, 9, 0, 0, 9, 30),
  },
  {
    id: "3",
    title: "Soccer Practice",
    calendarId: "sports",
    location: "Riverside Park Field 3",
    notes: "Bring water bottle and shin guards",
    ...duration(0, 16, 0, 0, 17, 30),
  },
  {
    id: "4",
    title: "Family Dinner",
    calendarId: "family",
    location: "Home",
    ...duration(0, 18, 30, 0, 20, 0),
  },

  // Tuesday
  {
    id: "5",
    title: "Dentist — Emma",
    calendarId: "personal",
    location: "Bright Smiles Dental",
    notes: "Annual checkup",
    ...duration(1, 10, 0, 1, 11, 0),
  },
  {
    id: "6",
    title: "Piano Lesson",
    calendarId: "school",
    location: "Ms. Chen's Studio",
    ...duration(1, 15, 30, 1, 16, 30),
  },
  {
    id: "7",
    title: "Grocery Run",
    calendarId: "family",
    location: "Whole Foods",
    ...duration(1, 17, 0, 1, 18, 0),
  },

  // Wednesday
  {
    id: "8",
    title: "School Pickup",
    calendarId: "school",
    location: "Lincoln Elementary",
    ...duration(2, 15, 0, 2, 15, 30),
  },
  {
    id: "9",
    title: "Swim Lessons",
    calendarId: "sports",
    location: "Community Pool",
    ...duration(2, 16, 0, 2, 17, 0),
  },
  {
    id: "10",
    title: "Book Club",
    calendarId: "personal",
    location: "Living Room",
    notes: "Chapter 12 discussion",
    ...duration(2, 19, 30, 2, 21, 0),
  },

  // Thursday
  {
    id: "11",
    title: "Parent-Teacher Conference",
    calendarId: "school",
    location: "Lincoln Elementary — Room 204",
    notes: "Mr. Johnson, 15 min slot",
    ...duration(3, 14, 0, 3, 14, 30),
  },
  {
    id: "12",
    title: "Basketball Game",
    calendarId: "sports",
    location: "Westside Gym",
    notes: "Away game — arrive 30 min early",
    ...duration(3, 17, 30, 3, 19, 30),
  },
  {
    id: "13",
    title: "Date Night",
    calendarId: "family",
    location: "Bella Italia",
    ...duration(3, 19, 0, 3, 22, 0),
  },

  // Friday
  {
    id: "14",
    title: "School Assembly",
    calendarId: "school",
    location: "Lincoln Elementary Gym",
    ...duration(4, 9, 0, 4, 10, 0),
  },
  {
    id: "15",
    title: "Work — Deep Focus",
    calendarId: "work",
    location: "Home Office",
    notes: "No meetings block",
    ...duration(4, 10, 0, 4, 12, 0),
  },
  {
    id: "16",
    title: "Pizza & Movie Night",
    calendarId: "family",
    location: "Home",
    ...duration(4, 18, 0, 4, 21, 0),
  },

  // Saturday
  {
    id: "17",
    title: "Soccer Tournament",
    calendarId: "sports",
    location: "Memorial Sports Complex",
    notes: "Bring chairs, sunscreen, snacks",
    ...duration(5, 8, 0, 5, 14, 0),
  },
  {
    id: "18",
    title: "Birthday Party — Jake",
    calendarId: "family",
    location: "FunZone Arcade",
    ...duration(5, 14, 30, 5, 17, 0),
  },
  {
    id: "19",
    title: "Farmers Market",
    calendarId: "family",
    location: "Downtown Square",
    ...duration(5, 9, 0, 5, 10, 30),
  },

  // Sunday
  {
    id: "20",
    title: "Church",
    calendarId: "family",
    location: "St. Mary's",
    ...duration(6, 10, 0, 6, 11, 30),
  },
  {
    id: "21",
    title: "Meal Prep",
    calendarId: "family",
    location: "Home",
    ...duration(6, 14, 0, 6, 16, 0),
  },
  {
    id: "22",
    title: "Family Game Night",
    calendarId: "family",
    location: "Living Room",
    ...duration(6, 18, 0, 6, 20, 30),
  },

  // Today-specific extras (will show in agenda)
  {
    id: "23",
    title: "Morning Coffee",
    calendarId: "personal",
    ...duration(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, 6, 30, new Date().getDay() === 0 ? 6 : new Date().getDay() - 1, 7, 0),
  },
];

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
        location: event.location,
        notes: event.notes,
      },
    };
  });
}

export function getEventsForDay(events: FamilyEvent[], date: Date): FamilyEvent[] {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23, 59, 59, 999);

  return events
    .filter((e) => {
      const start = new Date(e.start);
      return start >= dayStart && start <= dayEnd;
    })
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

