"use client";

import Link from "next/link";

interface SetupRequiredProps {
  displayId: string;
  error?: string;
  setupUrl?: string;
}

export function SetupRequired({ displayId, error }: SetupRequiredProps) {

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="max-w-lg">
        <h1 className="font-display text-4xl font-semibold text-white">Connect your calendars</h1>
        <p className="mt-4 text-xl text-white/60">
          This display needs a setup link with a private key, or Google Calendar must be connected.
        </p>
        {error && (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200">
            {error}
          </p>
        )}
      </div>

      <div className="glass-panel max-w-md p-8">
        <p className="text-sm text-white/40">On your phone or laptop:</p>
        <p className="mt-2 font-mono text-lg text-emerald-300">/setup</p>
        <p className="mt-4 text-sm text-white/50">
          Sign in with Google, select calendars (including your wife&apos;s shared calendars),
          then copy the Echo Show link.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/setup" className="touch-btn-primary !px-8">
          Open Setup
        </Link>
        <Link
          href={`/display/${displayId}`}
          className="touch-btn-secondary !px-8"
        >
          Demo mode (mock data)
        </Link>
      </div>
    </div>
  );
}
