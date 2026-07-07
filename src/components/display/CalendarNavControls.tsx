"use client";

import type { CalendarViewType } from "@/components/display/DisplayTopBar";

interface CalendarNavControlsProps {
  currentView: CalendarViewType;
  rangeTitle?: string;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
}

const PREV_LABEL: Record<CalendarViewType, string> = {
  timeGridWeek: "Previous week",
  timeGridDay: "Previous day",
  dayGridMonth: "Previous month",
  listWeek: "Previous",
};

const NEXT_LABEL: Record<CalendarViewType, string> = {
  timeGridWeek: "Next week",
  timeGridDay: "Next day",
  dayGridMonth: "Next month",
  listWeek: "Next",
};

export function CalendarNavControls({
  currentView,
  rangeTitle,
  onPrev,
  onToday,
  onNext,
}: CalendarNavControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        className="calendar-nav-btn"
        aria-label={PREV_LABEL[currentView]}
      >
        <ChevronLeft />
        <span>{PREV_LABEL[currentView]}</span>
      </button>
      <button type="button" onClick={onToday} className="calendar-nav-btn calendar-nav-today">
        Today
      </button>
      <button
        type="button"
        onClick={onNext}
        className="calendar-nav-btn"
        aria-label={NEXT_LABEL[currentView]}
      >
        <span>{NEXT_LABEL[currentView]}</span>
        <ChevronRight />
      </button>
      {rangeTitle && (
        <span className="ml-1 hidden font-display text-lg font-medium text-white/70 sm:inline">
          {rangeTitle}
        </span>
      )}
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
