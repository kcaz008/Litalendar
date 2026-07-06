"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CalendarSource, ConnectionStatus, FamilyEvent } from "@/types/calendar";
import { MOCK_CALENDARS, MOCK_DISPLAY, MOCK_EVENTS } from "@/lib/mock/events";
import { apiFetch } from "@/lib/api/client";

const CACHE_PREFIX = "litalendar-events-";

interface DisplayApiResponse {
  events: FamilyEvent[];
  calendars: CalendarSource[];
  connectionStatus: ConnectionStatus;
  lastUpdated: string;
  error?: string;
  setupUrl?: string;
  settings?: {
    title: string;
    editingEnabled: boolean;
    autoRefreshMins: number;
    reloadHours: number;
  };
}

interface UseDisplayEventsOptions {
  displayId: string;
  displayKey?: string;
}

interface UseDisplayEventsResult {
  events: FamilyEvent[];
  calendars: CalendarSource[];
  title: string;
  connectionStatus: ConnectionStatus;
  lastUpdated: Date;
  editingEnabled: boolean;
  autoRefreshMins: number;
  reloadHours: number;
  setupUrl?: string;
  error?: string;
  isLive: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

function loadCache(slug: string): DisplayApiResponse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${slug}`);
    if (!raw) return null;
    return JSON.parse(raw) as DisplayApiResponse;
  } catch {
    return null;
  }
}

function saveCache(slug: string, data: DisplayApiResponse) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${CACHE_PREFIX}${slug}`, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function useDisplayEvents({
  displayId,
  displayKey,
}: UseDisplayEventsOptions): UseDisplayEventsResult {
  const isLive = Boolean(displayKey);
  const cached = isLive ? loadCache(displayId) : null;

  const [events, setEvents] = useState<FamilyEvent[]>(
    cached?.events ?? (isLive ? [] : MOCK_EVENTS)
  );
  const [calendars, setCalendars] = useState<CalendarSource[]>(
    cached?.calendars ?? (isLive ? [] : MOCK_CALENDARS)
  );
  const [title, setTitle] = useState(
    cached?.settings?.title ?? MOCK_DISPLAY.title
  );
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    cached?.connectionStatus ?? (isLive ? "offline" : MOCK_DISPLAY.connectionStatus)
  );
  const [lastUpdated, setLastUpdated] = useState(
    () => new Date(cached?.lastUpdated ?? Date.now())
  );
  const [editingEnabled, setEditingEnabled] = useState(
    cached?.settings?.editingEnabled ?? MOCK_DISPLAY.editingEnabled
  );
  const [autoRefreshMins, setAutoRefreshMins] = useState(
    cached?.settings?.autoRefreshMins ?? 5
  );
  const [reloadHours, setReloadHours] = useState(cached?.settings?.reloadHours ?? 6);
  const [setupUrl, setSetupUrl] = useState<string | undefined>(cached?.setupUrl);
  const [error, setError] = useState<string | undefined>(cached?.error);
  const [isLoading, setIsLoading] = useState(isLive);

  const fetchEvents = useCallback(async () => {
    if (!displayKey) return;

    try {
      const res = await apiFetch(
        `/api/display/${displayId}/events?key=${encodeURIComponent(displayKey)}`
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setConnectionStatus("auth_error");
        setError(err.error ?? "Failed to load events");
        setIsLoading(false);
        return;
      }

      const data: DisplayApiResponse = await res.json();

      setEvents(data.events);
      setCalendars(data.calendars);
      setConnectionStatus(data.connectionStatus);
      setLastUpdated(new Date(data.lastUpdated));
      setTitle(data.settings?.title ?? "Family Calendar");
      setEditingEnabled(data.settings?.editingEnabled ?? true);
      setAutoRefreshMins(data.settings?.autoRefreshMins ?? 5);
      setReloadHours(data.settings?.reloadHours ?? 6);
      setSetupUrl(data.setupUrl);
      setError(data.error);
      saveCache(displayId, data);
    } catch {
      if (!cached) {
        setConnectionStatus("offline");
        setError("Could not reach server");
      } else {
        setConnectionStatus("cached");
      }
    } finally {
      setIsLoading(false);
    }
  }, [displayId, displayKey, cached]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (!displayKey) return;
    fetchEvents();
  }, [displayKey, fetchEvents]);

  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!displayKey || autoRefreshMins <= 0) return;

    refreshIntervalRef.current = setInterval(
      () => fetchEvents(),
      autoRefreshMins * 60_000
    );

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [displayKey, autoRefreshMins, fetchEvents]);

  useEffect(() => {
    if (!displayKey || reloadHours <= 0) return;

    const reloadMs = reloadHours * 60 * 60_000;
    const timer = setTimeout(() => window.location.reload(), reloadMs);
    return () => clearTimeout(timer);
  }, [displayKey, reloadHours]);

  return {
    events,
    calendars,
    title,
    connectionStatus,
    lastUpdated,
    editingEnabled,
    autoRefreshMins,
    reloadHours,
    setupUrl,
    error,
    isLive,
    isLoading,
    refresh,
  };
}
