"use client";

import type { ConnectionStatus } from "@/types/calendar";
import { formatZonedTime } from "@/lib/datetime/timezone";

interface DisplayStatusBannerProps {
  isDemoMode: boolean;
  usingCache: boolean;
  connectionStatus: ConnectionStatus;
  error?: string;
  calendarsCount: number;
  eventsCount: number;
  lastUpdated: Date;
}

export function DisplayStatusBanner({
  isDemoMode,
  usingCache,
  connectionStatus,
  error,
  calendarsCount,
  eventsCount,
  lastUpdated,
}: DisplayStatusBannerProps) {
  if (isDemoMode) {
    return (
      <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 py-3 text-sm text-violet-100">
        <strong>Demo mode</strong> — mock events only. Use your private setup link with{" "}
        <code className="text-violet-200">?key=</code> for real calendars.
      </div>
    );
  }

  if (usingCache || connectionStatus === "cached") {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <strong>Using last updated events</strong>
        {error ? ` — ${error}` : ""}. Updated{" "}
        {formatZonedTime(lastUpdated, { hour: "numeric", minute: "2-digit", hour12: true })}.
      </div>
    );
  }

  if (connectionStatus === "auth_error" && eventsCount > 0) {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        {error ?? "Google connection issue"} — showing last known events.
      </div>
    );
  }

  if (calendarsCount === 0 && connectionStatus === "connected") {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        No calendars selected. Open <strong>/setup</strong> and turn calendars on.
      </div>
    );
  }

  if (connectionStatus === "auth_error" && eventsCount === 0) {
    return null;
  }

  if (connectionStatus === "offline" && eventsCount === 0) {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
        Could not reach server and no cached events are available.
      </div>
    );
  }

  return null;
}
