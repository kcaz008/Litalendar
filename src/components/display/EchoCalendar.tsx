"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarApi, EventClickArg, EventDropArg } from "@fullcalendar/core";
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
  onEventClick: (info: EventClickArg) => void;
  onEventDrop: (info: EventDropArg) => void;
  onEventResize: (info: EventResizeDoneArg) => void;
}

export function EchoCalendar({
  events,
  calendars,
  currentView,
  onViewChange,
  calendarRef,
  onEventClick,
  onEventDrop,
  onEventResize,
}: EchoCalendarProps) {
  const internalRef = useRef<FullCalendar>(null);
  const todayKey = useMemo(
    () => getDateKeyInTimezone(new Date(), DISPLAY_TIMEZONE),
    []
  );

  useEffect(() => {
    const api = internalRef.current?.getApi();
    if (api) {
      calendarRef.current = api;
      api.today();
    }
  }, [calendarRef, todayKey]);

  useEffect(() => {
    const api = internalRef.current?.getApi();
    if (api && api.view.type !== currentView) {
      api.changeView(currentView);
    }
  }, [currentView]);

  const handleDatesSet = useCallback(
    (info: { view: { type: string } }) => {
      const viewType = info.view.type as CalendarViewType;
      if (viewType !== currentView) {
        onViewChange(viewType);
      }
    },
    [currentView, onViewChange]
  );

  return (
    <div className={`fc-echo-calendar fc-echo-${currentView} h-full min-h-0 flex-1`}>
      <FullCalendar
        ref={internalRef}
        plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        initialView={currentView}
        initialDate={todayKey}
        timeZone={DISPLAY_TIMEZONE}
        headerToolbar={false}
        events={toFullCalendarEvents(events, calendars)}
        height="100%"
        allDaySlot={false}
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
            slotMinTime: "06:00:00",
            slotMaxTime: "22:00:00",
            slotDuration: "00:30:00",
            slotLabelInterval: "01:00:00",
            expandRows: true,
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
  if (view === "timeGridWeek") {
    return "05:00:00";
  }
  const scrollHour = Math.max(6, hour - 1);
  return `${String(scrollHour).padStart(2, "0")}:00:00`;
}
