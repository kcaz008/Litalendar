"use client";

import { useEffect, useState } from "react";
import { formatZonedTime, getDateKeyInTimezone } from "@/lib/datetime/timezone";

interface LiveClockProps {
  className?: string;
  showSeconds?: boolean;
}

export function LiveClock({ className = "", showSeconds = true }: LiveClockProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return <span className={className}>--:--</span>;
  }

  return (
    <time dateTime={now.toISOString()} className={className}>
      {formatZonedTime(now, {
        hour: "numeric",
        minute: "2-digit",
        second: showSeconds ? "2-digit" : undefined,
        hour12: true,
      })}
    </time>
  );
}

export function LiveDate({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return <span className={className}>Loading...</span>;
  }

  return (
    <time dateTime={getDateKeyInTimezone(now)} className={className}>
      {formatZonedTime(now, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </time>
  );
}
