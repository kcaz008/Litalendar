"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DISPLAY_URL_KEY = "litalendar-display-url";

export default function HomePage() {
  const [displayUrl, setDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISPLAY_URL_KEY);
      if (stored) setDisplayUrl(stored);
    } catch {
      // ignore
    }
  }, []);

  const displayHref = displayUrl
    ? displayUrl.replace(/^https?:\/\/[^/]+/, "")
    : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-[#0a0e1a] via-[#12182b] to-[#0d1220] p-8 text-center">
      <div className="max-w-lg">
        <h1 className="font-display text-5xl font-semibold text-white">Litalendar</h1>
        <p className="mt-4 text-lg text-white/60">
          A beautiful touch-first family calendar for Echo Show 15
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href="/setup" className="touch-btn-primary rounded-2xl px-10 py-4 text-xl">
          Setup / Settings
        </Link>
        {displayHref ? (
          <Link href={displayHref} className="touch-btn-primary rounded-2xl px-10 py-4 text-xl">
            Open My Display
          </Link>
        ) : (
          <Link href="/display/kitchen" className="touch-btn-secondary rounded-2xl px-10 py-4 text-xl">
            Demo (mock data)
          </Link>
        )}
      </div>

      {displayHref && (
        <p className="max-w-md text-sm text-white/40">
          Use <strong className="text-white/60">Open My Display</strong> on your Echo Show.
          Demo mode is mock data only.
        </p>
      )}
    </main>
  );
}
