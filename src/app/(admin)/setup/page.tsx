"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

const DISPLAY_URL_KEY = "litalendar-display-url";

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
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; hasGoogle: boolean } | null>(null);
  const [calendars, setCalendars] = useState<CalendarSourceRow[]>([]);
  const [displays, setDisplays] = useState<DisplayRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const [copied, setCopied] = useState(false);

  const clearErrors = useCallback(() => {
    setError(null);
    setNeedsReconnect(false);
  }, []);

  const loadCalendars = useCallback(async (): Promise<CalendarSourceRow[]> => {
    const res = await apiFetch("/api/calendars");
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Failed to load calendars");
    }
    const data = await res.json();
    return data.sources ?? [];
  }, []);

  const persistDisplayUrl = useCallback((items: DisplayRow[]) => {
    if (items[0]?.url) {
      try {
        localStorage.setItem(DISPLAY_URL_KEY, items[0].url);
      } catch {
        // ignore
      }
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    clearErrors();
    setActionMessage(null);

    try {
      const meRes = await apiFetch("/api/auth/me");
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
        apiFetch("/api/displays"),
      ]);

      setCalendars(sources);
      if (sources.length > 0) clearErrors();

      if (dispRes.ok) {
        const dispData = await dispRes.json();
        const list = dispData.displays ?? [];
        setDisplays(list);
        persistDisplayUrl(list);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load setup");
    } finally {
      setLoading(false);
    }
  }, [router, loadCalendars, clearErrors, persistDisplayUrl]);

  useEffect(() => {
    load();
  }, [load]);

  const syncCalendars = async () => {
    setSyncing(true);
    clearErrors();
    setActionMessage(null);

    try {
      const res = await apiFetch("/api/calendars", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setCalendars(data.sources ?? []);
        setUser((u) => (u ? { ...u, hasGoogle: true } : u));
        clearErrors();
        if (data.warning) {
          setNeedsReconnect(Boolean(data.needsReconnect));
          setActionMessage("Calendars loaded. Reconnect Google to refresh from source.");
        } else {
          setActionMessage("Calendar list updated.");
        }
        return;
      }

      try {
        const existing = await loadCalendars();
        if (existing.length > 0) {
          setCalendars(existing);
          clearErrors();
          if (data.needsReconnect) setNeedsReconnect(true);
          setActionMessage("Using saved calendars. Reconnect Google to sync latest.");
          return;
        }
      } catch {
        // fall through
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
    const previous = calendars;
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
    setTogglingId(id);
    setActionMessage(null);

    try {
      const res = await apiFetch(`/api/calendars/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      });

      if (res.ok) {
        const data = await res.json();
        setCalendars((prev) =>
          prev.map((c) => (c.id === id ? { ...c, enabled: data.source.enabled } : c))
        );
        setActionMessage(`Saved — ${data.source.name} is ${data.source.enabled ? "on" : "off"}.`);
        clearErrors();
      } else {
        setCalendars(previous);
        const data = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError("Session expired. Please sign in again.");
          router.replace("/login?returnTo=/setup");
        } else {
          setActionMessage(data.error ?? "Failed to save calendar selection.");
        }
      }
    } catch {
      setCalendars(previous);
      setActionMessage("Failed to save calendar selection.");
    } finally {
      setTogglingId(null);
    }
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    try {
      localStorage.setItem(DISPLAY_URL_KEY, url);
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <p className="text-white/60">Loading setup...</p>;
  }

  const primaryDisplay = displays[0];
  const googleConnected = Boolean(user?.hasGoogle || calendars.length > 0);
  const showBlockingError = Boolean(error && calendars.length === 0);

  return (
    <div className="relative z-10 space-y-10 pb-16">
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

      {actionMessage && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-200">
          {actionMessage}
        </div>
      )}

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
        {needsReconnect && calendars.length > 0 && (
          <p className="mt-3 text-sm text-amber-200">
            Token may need refresh.{" "}
            <Link href="/api/auth/google?reconnect=1&returnTo=/setup" className="underline">
              Reconnect Google
            </Link>{" "}
            — your calendar selections below are still saved.
          </p>
        )}
      </section>

      {calendars.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">2. Choose calendars</h2>
          <p className="mt-1 text-white/50">
            Tap to turn calendars on or off. Changes save immediately.
          </p>
          <ul className="mt-4 space-y-2">
            {calendars.map((cal) => (
              <li key={cal.id}>
                <button
                  type="button"
                  onClick={() => toggleCalendar(cal.id, !cal.enabled)}
                  disabled={togglingId === cal.id}
                  aria-pressed={cal.enabled}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors active:scale-[0.99] disabled:opacity-70 ${
                    cal.enabled
                      ? "border-dashboard-accent/40 bg-dashboard-accent/15"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full ring-2 ring-white/20"
                    style={{ backgroundColor: cal.backgroundColor }}
                  />
                  <span className="flex-1 text-lg font-medium">{cal.name}</span>
                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-semibold ${
                      cal.enabled
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {togglingId === cal.id ? "..." : cal.enabled ? "On" : "Off"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {primaryDisplay && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">3. Open on Echo Show</h2>
          <p className="mt-1 text-white/50">
            Use this private link on your Echo Show 15 (not the demo link). Bookmark it in Silk.
          </p>
          <div className="mt-4 rounded-xl bg-black/30 p-4">
            <p className="break-all font-mono text-sm text-emerald-300">{primaryDisplay.url}</p>
          </div>
          <p className="mt-2 text-xs text-white/40">
            Only calendars turned <strong>On</strong> above will appear on the display.
          </p>
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
