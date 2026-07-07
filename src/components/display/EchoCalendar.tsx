"use client";

import { useCallback, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarApi, EventClickArg, EventContentArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import type { CalendarViewType } from "@/components/display/DisplayTopBar";
import { toFullCalendarEvents } from "@/lib/mock/events";
import { DISPLAY_TIMEZONE, getDateKeyInTimezone } from "@/lib/datetime/timezone";
import type { FamilyEvent } from "@/types/calendar";

interface EchoCalendarProps {
  events: FamilyEvent[];
  calendars: import("@/types/calendar").CalendarSource[];
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  calendarRef: React.MutableRefObject<CalendarApi | null>;
  anchorKey: number;
  onEventClick: (info: EventClickArg) => void;
  onEventDrop: (info: EventDropArg) => void;
  onEventResize: (info: EventResizeDoneArg) => void;
}

function getTodayAnchor(): string {
  return getDateKeyInTimezone(new Date(), DISPLAY_TIMEZONE);
}

export function EchoCalendar({
  events,
  calendars,
  currentView,
  onViewChange,
  calendarRef,
  anchorKey,
  onEventClick,
  onEventDrop,
  onEventResize,
}: EchoCalendarProps) {
  const internalRef = useRef<FullCalendar>(null);

  const navigateToToday = useCallback((view?: CalendarViewType) => {
    const api = internalRef.current?.getApi();
    if (!api) return;
    const today = getTodayAnchor();
    const targetView = view ?? (api.view.type as CalendarViewType);
    if (api.view.type !== targetView) {
      api.changeView(targetView, today);
    } else {
      api.gotoDate(today);
    }
  }, []);

  useEffect(() => {
    const api = internalRef.current?.getApi();
    if (api) {
      calendarRef.current = api;
      navigateToToday(currentView);
    }
  }, [calendarRef, anchorKey, currentView, navigateToToday]);

  const handleDatesSet = useCallback(
    (info: { view: { type: string } }) => {
      const viewType = info.view.type as CalendarViewType;
      if (viewType !== currentView) {
        onViewChange(viewType);
      }
    },
    [currentView, onViewChange]
  );

  const renderEventContent = useCallback((arg: EventContentArg) => {
    const initials = arg.event.extendedProps.calendarInitials as string | undefined;
    const isAllDay = arg.event.allDay;
    return (
      <div className="flex min-w-0 items-center gap-1.5 overflow-hidden px-1">
        {initials && (
          <span
            className="shrink-0 rounded-md bg-black/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/90"
            aria-hidden="true"
          >
            {initials}
          </span>
        )}
        {arg.timeText && !isAllDay && (
          <span className="shrink-0 text-[11px] font-medium opacity-90">{arg.timeText}</span>
        )}
        <span className="truncate font-semibold">{arg.event.title}</span>
      </div>
    );
  }, []);

  return (
    <div className={`fc-echo-calendar fc-echo-${currentView} h-full min-h-0 flex-1`}>
      <FullCalendar
        ref={internalRef}
        plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        initialView={currentView}
        initialDate={getTodayAnchor()}
        timeZone={DISPLAY_TIMEZONE}
        headerToolbar={false}
        events={toFullCalendarEvents(events, calendars)}
        eventContent={renderEventContent}
        height="100%"
        allDaySlot
        allDayText="All day"
        nowIndicator
        scrollTime={getScrollTime(currentView)}
        scrollTimeReset={false}
        firstDay={1}
        weekends
        editable
        eventStartEditable
        eventDurationEditable
        eventResizableFromStart
        snapDuration="00:15:00"
        views={{
          timeGridWeek: {
            type: "timeGrid",
            duration: { weeks: 1 },
            slotMinTime: "05:00:00",
            slotMaxTime: "23:00:00",
            slotDuration: "01:00:00",
            slotLabelInterval: "01:00:00",
            expandRows: true,
          },
          timeGridDay: {
            type: "timeGrid",
            duration: { days: 1 },
            slotMinTime: "05:00:00",
            slotMaxTime: "23:00:00",
            slotDuration: "00:30:00",
            slotLabelInterval: "01:00:00",
            expandRows: true,
          },
          dayGridMonth: {
            type: "dayGrid",
            fixedWeekCount: false,
            showNonCurrentDates: true,
          },
          listWeek: {
            type: "list",
            duration: { weeks: 2 },
            listDayFormat: { weekday: "long", month: "short", day: "numeric" },
            listDaySideFormat: false,
            noEventsText: "No upcoming events",
          },
        }}
        slotLabelFormat={{
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }}
        dayHeaderFormat={{
          weekday: "short",
          month: "short",
          day: "numeric",
        }}
        eventTimeFormat={{
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }}
        dayCellClassNames={(arg) => (arg.isToday ? ["fc-echo-today-cell"] : [])}
        datesSet={handleDatesSet}
        eventClick={onEventClick}
        eventDrop={onEventDrop}
        eventResize={onEventResize}
        longPressDelay={200}
        eventLongPressDelay={200}
        selectLongPressDelay={200}
      />
    </div>
  );
}

function getScrollTime(view: CalendarViewType): string {
  const now = new Date();
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: DISPLAY_TIMEZONE,
      hour: "numeric",
      hour12: false,
    }).format(now)
  );
  if (view === "timeGridWeek" || view === "dayGridMonth" || view === "listWeek") {
    return "05:00:00";
  }
  const scrollHour = Math.max(5, hour - 1);
  return `${String(scrollHour).padStart(2, "0")}:00:00`;
}
