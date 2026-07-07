"use client";

import {
  addZonedDays,
  DISPLAY_TIMEZONE,
  formatZonedTime,
  getTodayInTimezone,
} from "@/lib/datetime/timezone";
import { getEventsForDay } from "@/lib/display/agenda";
import type { FamilyEvent } from "@/types/calendar";

interface DisplaySidePanelProps {
  events: FamilyEvent[];
  onEventClick: (eventId: string) => void;
}

/** Minimal today/tomorrow strip — calendar stays full width. */
export function DisplaySidePanel({ events, onEventClick }: DisplaySidePanelProps) {
  const today = getTodayInTimezone(DISPLAY_TIMEZONE);
  const tomorrow = addZonedDays(today, 1, DISPLAY_TIMEZONE);
  const todayEvents = getEventsForDay(events, today, DISPLAY_TIMEZONE).slice(0, 3);
  const tomorrowEvents = getEventsForDay(events, tomorrow, DISPLAY_TIMEZONE).slice(0, 2);

  return (
    <aside className="flex w-[200px] shrink-0 flex-col gap-3 border-l border-white/10 py-1 pl-4 xl:w-[220px]">
      <MiniDay
        label="Today"
        date={today}
        events={todayEvents}
        empty="Clear"
        onEventClick={onEventClick}
      />
      <MiniDay
        label="Tomorrow"
        date={tomorrow}
        events={tomorrowEvents}
        empty="Open"
        onEventClick={onEventClick}
      />
    </aside>
  );
}

function MiniDay({
  label,
  date,
  events,
  empty,
  onEventClick,
}: {
  label: string;
  date: Date;
  events: FamilyEvent[];
  empty: string;
  onEventClick: (id: string) => void;
}) {
  const dateLabel = formatZonedTime(date, { month: "short", day: "numeric" });

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-white/40">
        {label} · {dateLabel}
      </h3>
      {events.length === 0 ? (
        <p className="mt-1 text-sm text-white/30">{empty}</p>
      ) : (
        <ul className="mt-1 space-y-1">
          {events.map((event) => (
            <li key={event.id}>
              <button
                type="button"
                onClick={() => onEventClick(event.id)}
                className="w-full truncate text-left text-sm text-white/70 hover:text-white"
              >
                {event.allDay ? "All day · " : ""}
                {event.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
