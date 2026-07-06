"use client";

import { useCallback, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarApi, EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import type { CalendarViewType } from "@/components/display/DisplayTopBar";
import { toFullCalendarEvents } from "@/lib/mock/events";
import type { FamilyEvent } from "@/types/calendar";

interface EchoCalendarProps {
  events: FamilyEvent[];
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  calendarRef: React.MutableRefObject<CalendarApi | null>;
  onEventClick: (info: EventClickArg) => void;
  onEventDrop: (info: EventDropArg) => void;
  onEventResize: (info: EventResizeDoneArg) => void;
}

export function EchoCalendar({
  events,
  currentView,
  onViewChange,
  calendarRef,
  onEventClick,
  onEventDrop,
  onEventResize,
}: EchoCalendarProps) {
  const internalRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const api = internalRef.current?.getApi();
    if (api) {
      calendarRef.current = api;
    }
  }, [calendarRef]);

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
    <div className="fc-echo-calendar h-full min-h-0 flex-1">
      <FullCalendar
        ref={internalRef}
        plugins={[timeGridPlugin, dayGridPlugin, listPlugin, interactionPlugin]}
        initialView={currentView}
        headerToolbar={false}
        events={toFullCalendarEvents(events)}
        height="100%"
        expandRows
        slotMinTime="06:00:00"
        slotMaxTime="22:00:00"
        allDaySlot={false}
        nowIndicator
        scrollTime={getScrollTime()}
        scrollTimeReset={false}
        slotDuration="00:30:00"
        slotLabelInterval="01:00:00"
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
        firstDay={1}
        weekends
        editable
        eventStartEditable
        eventDurationEditable
        eventResizableFromStart
        snapDuration="00:15:00"
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

function getScrollTime(): string {
  const now = new Date();
  const hour = Math.max(6, now.getHours() - 1);
  return `${String(hour).padStart(2, "0")}:00:00`;
}
