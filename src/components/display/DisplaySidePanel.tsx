"use client";

import {
  enrichEvent,
  formatTimeRange,
  getEventsForDay,
} from "@/lib/mock/events";
import { QUICK_ADD_PRESETS, type AddEventPrefill } from "@/lib/events/utils";
import type { FamilyEvent } from "@/types/calendar";

interface AgendaSectionProps {
  title: string;
  date: Date;
  events: FamilyEvent[];
  emptyMessage: string;
  onEventClick: (eventId: string) => void;
}

function AgendaSection({ title, date, events, emptyMessage, onEventClick }: AgendaSectionProps) {
  const dateLabel = date.toLocaleDateString("en-US", {
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
        <p className="rounded-xl bg-white/[0.03] px-4 py-6 text-center text-sm text-white/40">
          {emptyMessage}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {events.map((event) => {
            const enriched = enrichEvent(event);
            return (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => onEventClick(event.id)}
                  className="agenda-card w-full text-left"
                  aria-label={`${event.title}, ${formatTimeRange(event.start, event.end)}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: enriched.calendarColor }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold text-white">
                        {event.title}
                      </p>
                      <p className="mt-0.5 text-sm text-white/50">
                        {event.allDay
                          ? "All day"
                          : formatTimeRange(event.start, event.end)}
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

interface DisplaySidePanelProps {
  events: FamilyEvent[];
  onEventClick: (eventId: string) => void;
  onQuickAdd: (prefill?: AddEventPrefill) => void;
}

export function DisplaySidePanel({ events, onEventClick, onQuickAdd }: DisplaySidePanelProps) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayEvents = getEventsForDay(events, today);
  const tomorrowEvents = getEventsForDay(events, tomorrow);

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col gap-5 glass-panel p-5 xl:w-[380px]">
      <div className="side-panel-scroll flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
        <AgendaSection
          title="Today"
          date={today}
          events={todayEvents}
          emptyMessage="Nothing scheduled today"
          onEventClick={onEventClick}
        />

        <AgendaSection
          title="Tomorrow"
          date={tomorrow}
          events={tomorrowEvents}
          emptyMessage="Tomorrow is wide open"
          onEventClick={onEventClick}
        />

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

        <section>
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Weather</h3>
          <div className="placeholder-card flex items-center gap-4">
            <span className="text-4xl" aria-hidden="true">
              ☀️
            </span>
            <div>
              <p className="text-2xl font-semibold text-white/60">72°F</p>
              <p className="text-sm text-white/30">Coming soon</p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Grocery List</h3>
          <div className="placeholder-card">
            <p className="text-sm text-white/30">Coming soon — shared family list</p>
          </div>
        </section>

        <section>
          <h3 className="mb-3 font-display text-lg font-semibold text-white">Reminders</h3>
          <div className="placeholder-card">
            <p className="text-sm text-white/30">Coming soon — family reminders</p>
          </div>
        </section>
      </div>
    </aside>
  );
}
