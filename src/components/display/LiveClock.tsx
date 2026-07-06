"use client";

import { useEffect, useState } from "react";

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
      {now.toLocaleTimeString("en-US", {
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
    <time dateTime={now.toISOString().split("T")[0]} className={className}>
      {now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}
    </time>
  );
}
