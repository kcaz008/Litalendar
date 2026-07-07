"use client";

import { LiveClock, LiveDate } from "@/components/display/LiveClock";
import { ConnectionBadge } from "@/components/display/ConnectionBadge";
import { CalendarNavControls } from "@/components/display/CalendarNavControls";
import type { ConnectionStatus } from "@/types/calendar";
import { formatZonedTime } from "@/lib/datetime/timezone";

export type CalendarViewType = "timeGridWeek" | "timeGridDay" | "dayGridMonth" | "listWeek";

interface DisplayTopBarProps {
  title: string;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date;
  usingCache: boolean;
  currentView: CalendarViewType;
  rangeTitle?: string;
  onViewChange: (view: CalendarViewType) => void;
  onPrev: () => void;
  onToday: () => void;
  onNext: () => void;
  onRefresh: () => void;
}

const VIEW_TABS: { id: CalendarViewType; label: string }[] = [
  { id: "timeGridWeek", label: "Week" },
  { id: "timeGridDay", label: "Day" },
  { id: "dayGridMonth", label: "Month" },
  { id: "listWeek", label: "Agenda" },
];

function formatLastUpdated(date: Date): string {
  return formatZonedTime(date, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function DisplayTopBar({
  title,
  connectionStatus,
  lastUpdated,
  usingCache,
  currentView,
  rangeTitle,
  onViewChange,
  onPrev,
  onToday,
  onNext,
  onRefresh,
}: DisplayTopBarProps) {
  return (
    <header
      className="flex shrink-0 flex-col gap-3 px-4 pb-3"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <h1 className="truncate font-display text-2xl font-semibold text-white xl:text-display-lg">
            {title}
          </h1>
          <div className="hidden h-7 w-px bg-white/10 md:block" />
          <div className="hidden flex-col md:flex">
            <LiveDate className="text-sm text-white/70 xl:text-display-sm" />
            <LiveClock className="font-display text-xl text-white xl:text-display-xl" />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden flex-col items-end lg:flex">
            <span className="text-xs text-white/40">
              {usingCache || connectionStatus === "cached" ? "Last updated" : "Updated"}
            </span>
            <span className="text-sm font-medium text-white/60">
              {formatLastUpdated(lastUpdated)}
            </span>
          </div>
          <ConnectionBadge status={connectionStatus} />
          <button
            type="button"
            onClick={onRefresh}
            className="touch-btn-ghost !min-h-[48px] !min-w-[48px] !px-3"
            aria-label="Refresh calendar"
          >
            <RefreshIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <nav className="flex gap-2" aria-label="Calendar views">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewChange(tab.id)}
              className={`touch-btn !min-h-[48px] !px-5 !py-2 !text-base border ${
                currentView === tab.id ? "view-tab-active" : "view-tab-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <CalendarNavControls
          currentView={currentView}
          rangeTitle={rangeTitle}
          onPrev={onPrev}
          onToday={onToday}
          onNext={onNext}
        />
      </div>
    </header>
  );
}

function RefreshIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 6h4V2M8 18H4v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
