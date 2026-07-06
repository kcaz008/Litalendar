"use client";

import Link from "next/link";

type SetupMode = "auth_error" | "missing_key" | "no_calendars";

interface SetupRequiredProps {
  displayId: string;
  error?: string;
  setupUrl?: string;
  mode?: SetupMode;
}

export function SetupRequired({ displayId, error, mode = "auth_error" }: SetupRequiredProps) {
  const title =
    mode === "missing_key"
      ? "Private display link required"
      : "Connect your calendars";

  const description =
    mode === "missing_key"
      ? "This URL is missing the private key from setup. Demo mode is available without a key."
      : "Sign in with Google, select calendars, then open your private Echo Show link.";

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 px-8 text-center">
      <div className="max-w-lg">
        <h1 className="font-display text-4xl font-semibold text-white">{title}</h1>
        <p className="mt-4 text-xl text-white/60">{description}</p>
        {error && (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-200">
            {error}
          </p>
        )}
      </div>

      <div className="glass-panel max-w-md p-8 text-left">
        <p className="text-sm text-white/40">On your phone or laptop:</p>
        <p className="mt-2 font-mono text-lg text-emerald-300">/setup</p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-white/50">
          <li>Sign in with Google</li>
          <li>Turn on the calendars you want on the display</li>
          <li>Copy the private Echo link (with <code>?key=</code>)</li>
        </ol>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/setup" className="touch-btn-primary !px-8">
          Open Setup
        </Link>
        <Link href={`/display/${displayId}`} className="touch-btn-secondary !px-8">
          Demo mode (mock data)
        </Link>
      </div>
    </div>
  );
}
