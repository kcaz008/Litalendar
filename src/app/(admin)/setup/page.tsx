"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CalendarSourceRow {
  id: string;
  googleCalendarId: string;
  name: string;
  backgroundColor: string;
  enabled: boolean;
}

interface DisplayRow {
  id: string;
  slug: string;
  name: string;
  url: string;
  privateKey: string;
}

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [user, setUser] = useState<{ email: string; hasGoogle: boolean } | null>(null);
  const [calendars, setCalendars] = useState<CalendarSourceRow[]>([]);
  const [displays, setDisplays] = useState<DisplayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const meRes = await fetch("/api/auth/me");
    const me = await meRes.json();

    if (!me.configured) {
      setError("Database not configured. Add DATABASE_URL to your Vercel project.");
      setLoading(false);
      return;
    }

    if (!me.user) {
      router.replace("/login?returnTo=/setup");
      return;
    }

    setUser({ email: me.user.email, hasGoogle: me.user.hasGoogle });

    const [calRes, dispRes] = await Promise.all([
      fetch("/api/calendars"),
      fetch("/api/displays"),
    ]);

    if (calRes.ok) {
      const calData = await calRes.json();
      setCalendars(calData.sources ?? []);
    }

    if (dispRes.ok) {
      const dispData = await dispRes.json();
      setDisplays(dispData.displays ?? []);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const syncCalendars = async () => {
    setSyncing(true);
    const res = await fetch("/api/calendars", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setCalendars(data.sources ?? []);
    }
    setSyncing(false);
  };

  const toggleCalendar = async (id: string, enabled: boolean) => {
    const res = await fetch(`/api/calendars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    if (res.ok) {
      setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p className="text-white/60">Loading setup...</p>;
  }

  const primaryDisplay = displays[0];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-semibold">Setup</h1>
        <p className="mt-2 text-white/60">
          Signed in as <strong className="text-white">{user?.email}</strong>
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Step 1: Google */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">1. Google Calendar</h2>
        <p className="mt-1 text-white/50">
          {user?.hasGoogle
            ? "Your Google account is connected."
            : "Connect Google to import calendars."}
        </p>
        {!user?.hasGoogle && (
          <Link
            href="/api/auth/google?returnTo=/setup"
            className="mt-4 inline-block rounded-xl bg-dashboard-accent px-6 py-3 font-medium"
          >
            Connect Google
          </Link>
        )}
        {user?.hasGoogle && (
          <button
            type="button"
            onClick={syncCalendars}
            disabled={syncing}
            className="mt-4 rounded-xl border border-white/15 bg-white/10 px-6 py-3 font-medium disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Refresh calendar list"}
          </button>
        )}
      </section>

      {/* Step 2: Select calendars */}
      {calendars.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">2. Choose calendars</h2>
          <p className="mt-1 text-white/50">
            Select which calendars appear on your Echo Show (e.g. your wife&apos;s, yours,
            family).
          </p>
          <ul className="mt-4 space-y-2">
            {calendars.map((cal) => (
              <li key={cal.id}>
                <button
                  type="button"
                  onClick={() => toggleCalendar(cal.id, !cal.enabled)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    cal.enabled
                      ? "border-white/20 bg-white/10"
                      : "border-white/5 bg-white/[0.02] opacity-60"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: cal.backgroundColor }}
                  />
                  <span className="flex-1 font-medium">{cal.name}</span>
                  <span className="text-sm text-white/40">{cal.enabled ? "On" : "Off"}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Step 3: Display URL */}
      {primaryDisplay && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">3. Open on Echo Show</h2>
          <p className="mt-1 text-white/50">
            Open this URL in the Silk browser on your Echo Show 15. Bookmark it for easy access.
          </p>
          <div className="mt-4 rounded-xl bg-black/30 p-4">
            <p className="break-all font-mono text-sm text-emerald-300">{primaryDisplay.url}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => copyUrl(primaryDisplay.url)}
              className="rounded-xl bg-dashboard-accent px-6 py-3 font-medium"
            >
              {copied ? "Copied!" : "Copy link"}
            </button>
            <Link
              href={`/display/${primaryDisplay.slug}?key=${primaryDisplay.privateKey}`}
              className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 font-medium"
            >
              Preview display
            </Link>
            <Link
              href="/settings"
              className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white/60"
            >
              More settings
            </Link>
          </div>
        </section>
      )}

      {calendars.length === 0 && user?.hasGoogle && (
        <p className="text-white/50">
          No calendars found yet.{" "}
          <button type="button" onClick={syncCalendars} className="text-dashboard-accent underline">
            Sync from Google
          </button>
        </p>
      )}
    </div>
  );
}
