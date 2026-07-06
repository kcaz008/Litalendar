"use client";

import type { ConnectionStatus } from "@/types/calendar";

interface ConnectionBadgeProps {
  status: ConnectionStatus;
}

const STATUS_CONFIG: Record<
  ConnectionStatus,
  { label: string; dotClass: string; textClass: string }
> = {
  connected: {
    label: "Connected",
    dotClass: "status-dot-connected",
    textClass: "text-emerald-300",
  },
  cached: {
    label: "Cached",
    dotClass: "status-dot-cached",
    textClass: "text-amber-300",
  },
  offline: {
    label: "Offline",
    dotClass: "status-dot-offline",
    textClass: "text-red-300",
  },
  auth_error: {
    label: "Needs Setup",
    dotClass: "status-dot-offline",
    textClass: "text-red-300",
  },
};

export function ConnectionBadge({ status }: ConnectionBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 px-4 py-2">
      <span className={config.dotClass} aria-hidden="true" />
      <span className={`text-sm font-medium ${config.textClass}`}>{config.label}</span>
    </div>
  );
}
