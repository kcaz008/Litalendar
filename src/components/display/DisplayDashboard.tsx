"use client";

import { useCallback, useRef, useState } from "react";
import type { CalendarApi } from "@fullcalendar/core";
import { DisplayTopBar, type CalendarViewType } from "@/components/display/DisplayTopBar";
import { DisplaySidePanel } from "@/components/display/DisplaySidePanel";
import { EchoCalendar } from "@/components/display/EchoCalendar";
import { CalendarLegend } from "@/components/display/CalendarLegend";
import { MOCK_DISPLAY, MOCK_EVENTS } from "@/lib/mock/events";

interface DisplayDashboardProps {
  displayId: string;
}

export function DisplayDashboard({ displayId }: DisplayDashboardProps) {
  const calendarRef = useRef<CalendarApi | null>(null);
  const [currentView, setCurrentView] = useState<CalendarViewType>("timeGridWeek");
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [events] = useState(MOCK_EVENTS);

  const handleToday = useCallback(() => {
    calendarRef.current?.today();
  }, []);

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
    calendarRef.current?.refetchEvents();
  }, []);

  const handleAddEvent = useCallback(() => {
    /* Phase 2: open add event flow */
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <DisplayTopBar
        title={MOCK_DISPLAY.title}
        connectionStatus={MOCK_DISPLAY.connectionStatus}
        lastUpdated={lastUpdated}
        currentView={currentView}
        onViewChange={setCurrentView}
        onToday={handleToday}
        onRefresh={handleRefresh}
        onAddEvent={handleAddEvent}
      />

      <main className="flex min-h-0 flex-1 gap-5 px-6 pb-6">
        <div className="glass-panel-elevated flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
          <div className="min-h-0 flex-1">
            <EchoCalendar
              events={events}
              currentView={currentView}
              onViewChange={setCurrentView}
              calendarRef={calendarRef}
            />
          </div>
          <CalendarLegend />
        </div>

        <DisplaySidePanel />
      </main>

      {/* Hidden display ID for future auth */}
      <span className="sr-only" data-display-id={displayId}>
        Display {displayId}
      </span>
    </div>
  );
}
