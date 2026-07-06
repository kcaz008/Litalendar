"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CalendarSourceRow {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor: string;
  enabled: boolean;
}

interface DisplayRow {
  id: string;
  slug: string;
  name: string;
  url: string;
  privateKey: string;
  editingEnabled: boolean;
}

interface Settings {
  calendarTitle: string;
  autoRefreshMins: number;
  reloadHours: number;
  requirePinDelete: boolean;
}

const COLOR_OPTIONS = [
  "#5b8def", "#a78bfa", "#34d399", "#f59e0b",
  "#f472b6", "#38bdf8", "#fb7185", "#a3e635",
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calendars, setCalendars] = useState<CalendarSourceRow[]>([]);
  const [displays, setDisplays] = useState<DisplayRow[]>([]);
  const [settings, setSettings] = useState<Settings>({
    calendarTitle: "Family Calendar",
    autoRefreshMins: 5,
    reloadHours: 6,
    requirePinDelete: false,
  });
  const [deletePin, setDeletePin] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const meRes = await fetch("/api/auth/me");
    const me = await meRes.json();
    if (!me.user) {
      router.replace("/login?returnTo=/settings");
      return;
    }

    const [calRes, settingsRes, dispRes] = await Promise.all([
      fetch("/api/calendars"),
      fetch("/api/settings"),
      fetch("/api/displays"),
    ]);

    if (calRes.ok) {
      const data = await calRes.json();
      setCalendars(data.sources ?? []);
    }
    if (settingsRes.ok) {
      const data = await settingsRes.json();
      if (data.settings) setSettings(data.settings);
      if (data.displays) setDisplays(data.displays);
    }
    if (dispRes.ok) {
      const data = await dispRes.json();
      setDisplays(data.displays ?? []);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const saveSettings = async () => {
    setSaving(true);
    const display = displays[0];
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...settings,
        displayId: display?.id,
        editingEnabled: display?.editingEnabled,
        deletePin: deletePin || undefined,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleCalendar = async (id: string, enabled: boolean) => {
    await fetch(`/api/calendars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    });
    setCalendars((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));
  };

  const setCalendarColor = async (id: string, backgroundColor: string) => {
    await fetch(`/api/calendars/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ backgroundColor, borderColor: backgroundColor }),
    });
    setCalendars((prev) =>
      prev.map((c) => (c.id === id ? { ...c, backgroundColor, borderColor: backgroundColor } : c))
    );
  };

  const regenerateKey = async () => {
    const display = displays[0];
    if (!display || !confirm("Regenerate display key? Old Echo Show links will stop working.")) {
      return;
    }
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayId: display.id, regenerateKey: true }),
    });
    if (res.ok) {
      const data = await res.json();
      setDisplays(data.displays);
    }
  };

  if (loading) return <p className="text-white/60">Loading settings...</p>;

  const display = displays[0];

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <Link href="/setup" className="text-sm text-white/50 hover:text-white">
          ← Setup
        </Link>
      </div>

      {/* Display settings */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Display</h2>
        <label className="block">
          <span className="text-sm text-white/50">Calendar title</span>
          <input
            type="text"
            value={settings.calendarTitle}
            onChange={(e) => setSettings((s) => ({ ...s, calendarTitle: e.target.value }))}
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3"
          />
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={display?.editingEnabled ?? true}
            onChange={(e) =>
              setDisplays((d) =>
                d.map((disp, i) =>
                  i === 0 ? { ...disp, editingEnabled: e.target.checked } : disp
                )
              )
            }
            className="h-5 w-5"
          />
          <span>Allow touch editing on Echo Show</span>
        </label>
        <label className="block">
          <span className="text-sm text-white/50">Auto-refresh (minutes)</span>
          <input
            type="number"
            min={1}
            max={60}
            value={settings.autoRefreshMins}
            onChange={(e) =>
              setSettings((s) => ({ ...s, autoRefreshMins: Number(e.target.value) }))
            }
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3"
          />
        </label>
        <label className="block">
          <span className="text-sm text-white/50">Delete PIN (optional)</span>
          <input
            type="password"
            inputMode="numeric"
            value={deletePin}
            onChange={(e) => setDeletePin(e.target.value)}
            placeholder="Leave blank to disable"
            className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3"
          />
        </label>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={settings.requirePinDelete}
            onChange={(e) =>
              setSettings((s) => ({ ...s, requirePinDelete: e.target.checked }))
            }
            className="h-5 w-5"
          />
          <span>Require PIN before deleting events</span>
        </label>
      </section>

      {/* Calendars */}
      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">Calendars</h2>
        <ul className="mt-4 space-y-3">
          {calendars.map((cal) => (
            <li key={cal.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => toggleCalendar(cal.id, !cal.enabled)}
                  className="flex items-center gap-3"
                >
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: cal.backgroundColor }}
                  />
                  <span className="font-medium">{cal.name}</span>
                </button>
                <span className="text-sm text-white/40">{cal.enabled ? "On" : "Off"}</span>
              </div>
              <div className="mt-3 flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCalendarColor(cal.id, color)}
                    className={`h-8 w-8 rounded-full border-2 ${
                      cal.backgroundColor === color ? "border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set color ${color}`}
                  />
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Display URL */}
      {display && (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Echo Show link</h2>
          <p className="mt-2 break-all font-mono text-sm text-emerald-300">
            {display.url}
          </p>
          <button
            type="button"
            onClick={regenerateKey}
            className="mt-4 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-300"
          >
            Regenerate private key
          </button>
        </section>
      )}

      <button
        type="button"
        onClick={saveSettings}
        disabled={saving}
        className="rounded-xl bg-dashboard-accent px-8 py-4 text-lg font-medium disabled:opacity-50"
      >
        {saving ? "Saving..." : saved ? "Saved!" : "Save settings"}
      </button>

      <form action="/api/auth/logout" method="GET">
        <button type="submit" className="text-sm text-white/40 underline">
          Sign out
        </button>
      </form>
    </div>
  );
}
