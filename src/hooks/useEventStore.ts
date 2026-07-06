"use client";

import { useCallback, useRef, useState } from "react";
import { cloneEvents } from "@/lib/events/utils";
import type { FamilyEvent } from "@/types/calendar";

export interface UndoState {
  previousEvents: FamilyEvent[];
  message: string;
}

export function useEventStore(initialEvents: FamilyEvent[]) {
  const [events, setEvents] = useState<FamilyEvent[]>(() => cloneEvents(initialEvents));
  const [undo, setUndo] = useState<UndoState | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearUndoTimer = useCallback(() => {
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }
  }, []);

  const scheduleUndo = useCallback(
    (state: UndoState) => {
      clearUndoTimer();
      setUndo(state);
      undoTimerRef.current = setTimeout(() => {
        setUndo(null);
        undoTimerRef.current = null;
      }, 10_000);
    },
    [clearUndoTimer]
  );

  const performUndo = useCallback(() => {
    if (!undo) return;
    clearUndoTimer();
    setEvents(cloneEvents(undo.previousEvents));
    setUndo(null);
  }, [undo, clearUndoTimer]);

  const replaceEvents = useCallback((next: FamilyEvent[]) => {
    setEvents(cloneEvents(next));
  }, []);

  const dismissUndo = useCallback(() => {
    clearUndoTimer();
    setUndo(null);
  }, [clearUndoTimer]);

  const applyMutation = useCallback(
    (mutator: (prev: FamilyEvent[]) => FamilyEvent[], message: string) => {
      setEvents((prev) => {
        scheduleUndo({ previousEvents: cloneEvents(prev), message });
        return mutator(prev);
      });
    },
    [scheduleUndo]
  );

  const createEvent = useCallback(
    (event: FamilyEvent) => {
      applyMutation((prev) => [...prev, event], "Event created");
    },
    [applyMutation]
  );

  const updateEvent = useCallback(
    (event: FamilyEvent) => {
      applyMutation(
        (prev) => prev.map((e) => (e.id === event.id ? event : e)),
        "Event updated"
      );
    },
    [applyMutation]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      applyMutation((prev) => prev.filter((e) => e.id !== eventId), "Event deleted");
    },
    [applyMutation]
  );

  const getEventById = useCallback(
    (id: string) => events.find((e) => e.id === id),
    [events]
  );

  return {
    events,
    undo,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    performUndo,
    dismissUndo,
    replaceEvents,
  };
}
