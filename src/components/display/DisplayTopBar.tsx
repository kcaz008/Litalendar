"use client";

import { LiveClock, LiveDate } from "@/components/display/LiveClock";
import { ConnectionBadge } from "@/components/display/ConnectionBadge";
import type { ConnectionStatus } from "@/types/calendar";
import { formatZonedTime } from "@/lib/datetime/timezone";

export type CalendarViewType = "timeGridWeek" | "timeGridDay" | "dayGridMonth" | "listWeek";

interface DisplayTopBarProps {
  title: string;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date;
  usingCache: boolean;
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  onToday: () => void;
  onRefresh: () => void;
  onAddEvent: () => void;
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
  onViewChange,
  onToday,
  onRefresh,
  onAddEvent,
}: DisplayTopBarProps) {
  return (
    <header
      className="flex shrink-0 flex-col gap-4 px-6 pb-4"
      style={{ paddingTop: "var(--safe-top)" }}
    >
      {/* Row 1: Title, clock, status, actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-6">
          <h1 className="font-display text-display-lg text-white">{title}</h1>
          <div className="hidden h-8 w-px bg-white/10 lg:block" />
          <div className="hidden flex-col lg:flex">
            <LiveDate className="text-display-sm text-white/70" />
            <LiveClock className="font-display text-display-xl text-white" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-end sm:flex">
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
          <button type="button" onClick={onToday} className="touch-btn-secondary !px-6">
            Today
          </button>
          <button type="button" onClick={onAddEvent} className="touch-btn-primary !px-6">
            <PlusIcon />
            Add Event
          </button>
        </div>
      </div>

      {/* Row 2: View switcher + mobile clock */}
      <div className="flex items-center justify-between gap-4">
        <nav className="flex gap-2" aria-label="Calendar views">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewChange(tab.id)}
              className={`touch-btn !min-h-[44px] !px-5 !py-2 !text-base border ${
                currentView === tab.id ? "view-tab-active" : "view-tab-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex flex-col items-end lg:hidden">
          <LiveDate className="text-sm text-white/60" />
          <LiveClock className="font-display text-2xl text-white" showSeconds={false} />
        </div>
      </div>
    </header>
  );
}

function PlusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
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
