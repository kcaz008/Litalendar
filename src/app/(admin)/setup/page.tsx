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

function applyCalendars(
  sources: CalendarSourceRow[],
  setCalendars: (c: CalendarSourceRow[]) => void,
  clearErrors: () => void
) {
  setCalendars(sources);
  if (sources.length > 0) {
    clearErrors();
  }
}

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; hasGoogle: boolean } | null>(null);
  const [calendars, setCalendars] = useState<CalendarSourceRow[]>([]);
  const [displays, setDisplays] = useState<DisplayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [copied, setCopied] = useState(false);

  const clearErrors = useCallback(() => {
    setError(null);
    setNeedsReconnect(false);
  }, []);

  const loadCalendars = useCallback(async (): Promise<CalendarSourceRow[]> => {
    const res = await fetch("/api/calendars");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to load calendars");
    }
    const data = await res.json();
    return data.sources ?? [];
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    clearErrors();

    try {
      const meRes = await fetch("/api/auth/me");
      const me = await meRes.json();

      if (!me.configured) {
        setError("Database not configured. Add DATABASE_URL to your Vercel project.");
        return;
      }

      if (!me.user) {
        router.replace("/login?returnTo=/setup");
        return;
      }

      setUser({ email: me.user.email, hasGoogle: me.user.hasGoogle });

      const [sources, dispRes] = await Promise.all([
        loadCalendars(),
        fetch("/api/displays"),
      ]);

      applyCalendars(sources, setCalendars, clearErrors);

      if (dispRes.ok) {
        const dispData = await dispRes.json();
        setDisplays(dispData.displays ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load setup");
    } finally {
      setLoading(false);
    }
  }, [router, loadCalendars, clearErrors]);

  useEffect(() => {
    load();
  }, [load]);

  const syncCalendars = async () => {
    setSyncing(true);
    clearErrors();

    try {
      const res = await fetch("/api/calendars", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        applyCalendars(data.sources ?? [], setCalendars, clearErrors);
        setUser((u) => (u ? { ...u, hasGoogle: true } : u));
        if (data.warning) {
          setNeedsReconnect(Boolean(data.needsReconnect));
        }
        return;
      }

      // POST failed — try loading existing calendars from DB without blocking UI
      try {
        const existing = await loadCalendars();
        if (existing.length > 0) {
          applyCalendars(existing, setCalendars, clearErrors);
          // Non-blocking warning only when we still have calendars to use
          if (data.needsReconnect) {
            setNeedsReconnect(true);
          }
          return;
        }
      } catch {
        // fall through to full error below
      }

      setError(data.error ?? "Calendar sync failed");
      setNeedsReconnect(Boolean(data.needsReconnect));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calendar sync failed");
    } finally {
      setSyncing(false);
    }
  };

  const toggleCalendar = async (id: string, enabled: boolean) => {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/calendars/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (res.ok) {
        setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
        clearErrors();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to update calendar");
      }
    } catch {
      setError("Failed to update calendar");
    } finally {
      setTogglingId(null);
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
  const googleConnected = Boolean(user?.hasGoogle || calendars.length > 0);
  const showBlockingError = Boolean(error && calendars.length === 0);
  const showReconnectHint = needsReconnect && !syncing;

  return (
    <div className="space-y-10 pb-12">
      <div>
        <h1 className="font-display text-3xl font-semibold">Setup</h1>
        <p className="mt-2 text-white/60">
          Signed in as <strong className="text-white">{user?.email}</strong>
        </p>
      </div>

      {showBlockingError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Step 1: Google */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">1. Google Calendar</h2>
        <p className="mt-1 text-white/50">
          {googleConnected
            ? "Your Google account is connected."
            : "Connect Google to import calendars."}
        </p>
        {!googleConnected && (
          <Link
            href="/api/auth/google?returnTo=/setup"
            className="mt-4 inline-block rounded-xl bg-dashboard-accent px-6 py-3 font-medium"
          >
            Connect Google
          </Link>
        )}
        {googleConnected && (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={syncCalendars}
              disabled={syncing}
              className="rounded-xl border border-white/15 bg-white/10 px-6 py-3 font-medium disabled:opacity-50"
            >
              {syncing ? "Syncing..." : "Refresh calendar list"}
            </button>
            <Link
              href="/api/auth/google?reconnect=1&returnTo=/setup"
              className="rounded-xl border border-white/15 px-6 py-3 font-medium text-white/70"
            >
              Reconnect Google
            </Link>
          </div>
        )}
        {showReconnectHint && (
          <p className="mt-3 text-sm text-amber-200">
            Calendar permissions may need updating.{" "}
            <Link href="/api/auth/google?reconnect=1&returnTo=/setup" className="underline">
              Reconnect Google
            </Link>{" "}
            to refresh access. Your calendars below are still available.
          </p>
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
                  disabled={togglingId === cal.id}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors active:scale-[0.99] disabled:opacity-70 ${
                    cal.enabled
                      ? "border-white/20 bg-white/10"
                      : "border-white/5 bg-white/[0.02] opacity-80"
                  }`}
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: cal.backgroundColor }}
                  />
                  <span className="flex-1 font-medium">{cal.name}</span>
                  <span className="text-sm text-white/40">
                    {togglingId === cal.id ? "..." : cal.enabled ? "On" : "Off"}
                  </span>
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

      {calendars.length === 0 && googleConnected && (
        <p className="text-white/50">
          No calendars found yet.{" "}
          <button
            type="button"
            onClick={syncCalendars}
            disabled={syncing}
            className="text-dashboard-accent underline disabled:opacity-50"
          >
            Sync from Google
          </button>
        </p>
      )}
    </div>
  );
}
