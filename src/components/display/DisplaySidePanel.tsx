"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addZonedDays,
  DISPLAY_TIMEZONE,
  formatZonedTime,
  getTodayInTimezone,
} from "@/lib/datetime/timezone";
import {
  enrichEventWithCalendar,
  getEventsForDay,
  getNextUpEvent,
  getRemainingTodayEvents,
} from "@/lib/display/agenda";
import { formatTimeRange } from "@/lib/mock/events";
import { QUICK_ADD_PRESETS, type AddEventPrefill } from "@/lib/events/utils";
import { WeatherPlaceholder } from "@/components/display/WeatherPlaceholder";
import type { FamilyEvent } from "@/types/calendar";

interface DisplaySidePanelProps {
  events: FamilyEvent[];
  calendars: import("@/types/calendar").CalendarSource[];
  isDemoMode: boolean;
  onEventClick: (eventId: string) => void;
  onQuickAdd: (prefill?: AddEventPrefill) => void;
}

function NextUpCard({
  event,
  calendars,
  onEventClick,
}: {
  event: FamilyEvent | null;
  calendars: import("@/types/calendar").CalendarSource[];
  onEventClick: (eventId: string) => void;
}) {
  if (!event) {
    return (
      <section className="next-up-card">
        <p className="text-sm font-medium uppercase tracking-wide text-white/40">Next up</p>
        <p className="mt-3 font-display text-2xl font-semibold text-white">Nothing else today</p>
        <p className="mt-2 text-sm text-white/45">Enjoy the open time — check tomorrow below.</p>
      </section>
    );
  }

  const enriched = enrichEventWithCalendar(event, calendars);

  return (
    <section className="next-up-card">
      <p className="text-sm font-medium uppercase tracking-wide text-emerald-300/80">Next up</p>
      <button
        type="button"
        onClick={() => onEventClick(event.id)}
        className="mt-3 w-full text-left"
        aria-label={`Next up: ${event.title}`}
      >
        <div className="flex items-start gap-3">
          <span
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: enriched.calendarColor }}
          >
            {enriched.calendarInitials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-2xl font-semibold text-white">{event.title}</p>
            <p className="mt-1 text-lg text-white/60">
              {event.allDay ? "All day" : formatTimeRange(event.start, event.end, event.allDay)}
            </p>
            {event.location && (
              <p className="mt-1 truncate text-sm text-white/40">{event.location}</p>
            )}
            <p className="mt-1 text-xs uppercase tracking-wide text-white/35">{enriched.calendarName}</p>
          </div>
        </div>
      </button>
    </section>
  );
}

function AgendaList({
  title,
  date,
  events,
  calendars,
  emptyMessage,
  onEventClick,
}: {
  title: string;
  date: Date;
  events: FamilyEvent[];
  calendars: import("@/types/calendar").CalendarSource[];
  emptyMessage: string;
  onEventClick: (eventId: string) => void;
}) {
  const dateLabel = formatZonedTime(date, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
        <span className="text-sm text-white/40">{dateLabel}</span>
      </div>

      {events.length === 0 ? (
        <p className="rounded-xl bg-white/[0.03] px-4 py-5 text-center text-sm text-white/40">
          {emptyMessage}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => {
            const enriched = enrichEventWithCalendar(event, calendars);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onEventClick(event.id)}
                  className="agenda-card w-full text-left"
                  aria-label={`${event.title}, ${formatTimeRange(event.start, event.end, event.allDay)}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                      style={{ backgroundColor: enriched.calendarColor }}
                    >
                      {enriched.calendarInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-white">{event.title}</p>
                      <p className="mt-0.5 text-sm text-white/50">
                        {event.allDay
                          ? "All day"
                          : formatTimeRange(event.start, event.end, event.allDay)}
                      </p>
                      {event.location && (
                        <p className="mt-1 truncate text-sm text-white/35">{event.location}</p>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function DisplaySidePanel({
  events,
  calendars,
  isDemoMode,
  onEventClick,
  onQuickAdd,
}: DisplaySidePanelProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const today = getTodayInTimezone(DISPLAY_TIMEZONE);
  const tomorrow = addZonedDays(today, 1, DISPLAY_TIMEZONE);

  const todayEvents = useMemo(
    () => getEventsForDay(events, today, DISPLAY_TIMEZONE),
    [events, today]
  );
  const nextUp = useMemo(
    () => getNextUpEvent(events, now, DISPLAY_TIMEZONE),
    [events, now]
  );
  const remainingToday = useMemo(
    () => getRemainingTodayEvents(events, now, DISPLAY_TIMEZONE),
    [events, now]
  );
  const tomorrowEvents = useMemo(
    () => getEventsForDay(events, tomorrow, DISPLAY_TIMEZONE),
    [events, tomorrow]
  );

  const allDayToday = todayEvents.filter((e) => e.allDay);
  const timedRemaining = remainingToday.filter((e) => !e.allDay);

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col gap-4 glass-panel p-5 xl:w-[400px]">
      <div className="side-panel-scroll flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
        <NextUpCard event={nextUp} calendars={calendars} onEventClick={onEventClick} />

        {allDayToday.length > 0 && (
          <section>
            <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-white/45">
              All day today
            </h3>
            <ul className="flex flex-col gap-2">
              {allDayToday.map((event) => {
                const enriched = enrichEventWithCalendar(event, calendars);
                return (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => onEventClick(event.id)}
                      className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 text-left"
                    >
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                        style={{ backgroundColor: enriched.calendarColor }}
                      >
                        {enriched.calendarInitials}
                      </span>
                      <span className="truncate font-medium text-white">{event.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <AgendaList
          title={nextUp ? "Later today" : "Today"}
          date={today}
          events={timedRemaining}
          calendars={calendars}
          emptyMessage={
            todayEvents.length === 0
              ? isDemoMode
                ? "No demo events today"
                : "Nothing scheduled today"
              : "Nothing else today"
          }
          onEventClick={onEventClick}
        />

        <AgendaList
          title="Tomorrow"
          date={tomorrow}
          events={tomorrowEvents}
          calendars={calendars}
          emptyMessage="Tomorrow is wide open"
          onEventClick={onEventClick}
        />

        {!isDemoMode && (
          <section>
            <h3 className="mb-3 font-display text-lg font-semibold text-white">Quick Add</h3>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ADD_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onQuickAdd(preset.prefill)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left text-sm font-medium text-white/80 active:bg-white/10"
                >
                  <span className="text-lg" aria-hidden="true">
                    {preset.emoji}
                  </span>
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
        )}

        <section>
          <WeatherPlaceholder />
        </section>
      </div>
    </aside>
  );
}
