"use client";

import { useCallback, useRef, useState } from "react";
import type { CalendarApi, EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { DisplayTopBar, type CalendarViewType } from "@/components/display/DisplayTopBar";
import { DisplaySidePanel } from "@/components/display/DisplaySidePanel";
import { EchoCalendar } from "@/components/display/EchoCalendar";
import { CalendarLegend } from "@/components/display/CalendarLegend";
import { UndoToast } from "@/components/display/UndoToast";
import { EventDetailsModal } from "@/components/display/modals/EventDetailsModal";
import { EventFormModal, type EventFormData } from "@/components/display/modals/EventFormModal";
import { ConfirmActionModal } from "@/components/display/modals/ConfirmActionModal";
import { ConflictModal } from "@/components/display/modals/ConflictModal";
import { useEventStore } from "@/hooks/useEventStore";
import {
  eventFromForm,
  findConflicts,
  formFromEvent,
  type AddEventPrefill,
} from "@/lib/events/utils";
import { MOCK_DISPLAY, MOCK_EVENTS } from "@/lib/mock/events";
import type { FamilyEvent } from "@/types/calendar";

interface DisplayDashboardProps {
  displayId: string;
}

interface PendingChange {
  oldEvent: FamilyEvent;
  newEvent: FamilyEvent;
}

interface ConflictState {
  event: FamilyEvent;
  conflicts: FamilyEvent[];
  onConfirm: () => void;
}

export function DisplayDashboard({ displayId }: DisplayDashboardProps) {
  const calendarRef = useRef<CalendarApi | null>(null);
  const [currentView, setCurrentView] = useState<CalendarViewType>("timeGridWeek");
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  const {
    events,
    undo,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    performUndo,
    dismissUndo,
  } = useEventStore(MOCK_EVENTS);

  const [detailsEventId, setDetailsEventId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [addPrefill, setAddPrefill] = useState<AddEventPrefill | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<FamilyEvent | null>(null);
  const [pendingMove, setPendingMove] = useState<PendingChange | null>(null);
  const [pendingResize, setPendingResize] = useState<PendingChange | null>(null);
  const [conflict, setConflict] = useState<ConflictState | null>(null);

  const selectedEvent = detailsEventId ? getEventById(detailsEventId) : undefined;
  const editEvent = editEventId ? getEventById(editEventId) : undefined;

  const closeAllModals = useCallback(() => {
    setDetailsEventId(null);
    setFormOpen(false);
    setEditEventId(null);
    setAddPrefill(undefined);
    setDeleteTarget(null);
    setPendingMove(null);
    setPendingResize(null);
    setConflict(null);
  }, []);

  const openEventDetails = useCallback((eventId: string) => {
    setDetailsEventId(eventId);
  }, []);

  const openAddEvent = useCallback((prefill?: AddEventPrefill) => {
    setFormMode("add");
    setEditEventId(null);
    setAddPrefill(prefill);
    setDetailsEventId(null);
    setFormOpen(true);
  }, []);

  const openEditEvent = useCallback((eventId: string) => {
    setFormMode("edit");
    setEditEventId(eventId);
    setAddPrefill(undefined);
    setDetailsEventId(null);
    setFormOpen(true);
  }, []);

  const checkConflictsAndApply = useCallback(
    (event: FamilyEvent, apply: () => void) => {
      const conflicts = findConflicts(event, events);
      if (conflicts.length > 0) {
        setConflict({ event, conflicts, onConfirm: apply });
      } else {
        apply();
        closeAllModals();
      }
    },
    [events, closeAllModals]
  );

  const handleFormSave = useCallback(
    (form: EventFormData) => {
      const built = eventFromForm(form);

      if (formMode === "add") {
        checkConflictsAndApply(built, () => {
          createEvent(built);
          setFormOpen(false);
          setAddPrefill(undefined);
        });
      } else if (form.id) {
        checkConflictsAndApply(built, () => {
          updateEvent(built);
          setFormOpen(false);
          setEditEventId(null);
        });
      }
    },
    [formMode, checkConflictsAndApply, createEvent, updateEvent]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteEvent(deleteTarget.id);
    setDeleteTarget(null);
    setDetailsEventId(null);
  }, [deleteTarget, deleteEvent]);

  const handleMoveConfirm = useCallback(() => {
    if (!pendingMove) return;
    checkConflictsAndApply(pendingMove.newEvent, () => {
      updateEvent(pendingMove.newEvent);
      setPendingMove(null);
    });
  }, [pendingMove, checkConflictsAndApply, updateEvent]);

  const handleResizeConfirm = useCallback(() => {
    if (!pendingResize) return;
    checkConflictsAndApply(pendingResize.newEvent, () => {
      updateEvent(pendingResize.newEvent);
      setPendingResize(null);
    });
  }, [pendingResize, checkConflictsAndApply, updateEvent]);

  const handleConflictSaveAnyway = useCallback(() => {
    if (!conflict) return;
    conflict.onConfirm();
    setConflict(null);
    closeAllModals();
  }, [conflict, closeAllModals]);

  const handleEventClick = useCallback(
    (info: EventClickArg) => {
      openEventDetails(info.event.id);
    },
    [openEventDetails]
  );

  const handleEventDrop = useCallback(
    (info: EventDropArg) => {
      const oldEvent = getEventById(info.event.id);
      if (!oldEvent || !info.event.start) {
        info.revert();
        return;
      }

      const newEvent: FamilyEvent = {
        ...oldEvent,
        start: info.event.start.toISOString(),
        end: info.event.end?.toISOString() ?? oldEvent.end,
      };

      info.revert();
      setPendingMove({ oldEvent, newEvent });
    },
    [getEventById]
  );

  const handleEventResize = useCallback(
    (info: EventResizeDoneArg) => {
      const oldEvent = getEventById(info.event.id);
      if (!oldEvent || !info.event.start || !info.event.end) {
        info.revert();
        return;
      }

      const newEvent: FamilyEvent = {
        ...oldEvent,
        start: info.event.start.toISOString(),
        end: info.event.end.toISOString(),
      };

      info.revert();
      setPendingResize({ oldEvent, newEvent });
    },
    [getEventById]
  );

  const handleToday = useCallback(() => {
    calendarRef.current?.today();
  }, []);

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden">
      <DisplayTopBar
        title={MOCK_DISPLAY.title}
        connectionStatus={MOCK_DISPLAY.connectionStatus}
        lastUpdated={lastUpdated}
        currentView={currentView}
        onViewChange={setCurrentView}
        onToday={handleToday}
        onRefresh={handleRefresh}
        onAddEvent={() => openAddEvent()}
      />

      <main className="flex min-h-0 flex-1 gap-5 px-6 pb-6">
        <div className="glass-panel-elevated flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-4">
          <div className="min-h-0 flex-1">
            <EchoCalendar
              events={events}
              currentView={currentView}
              onViewChange={setCurrentView}
              calendarRef={calendarRef}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
              onEventResize={handleEventResize}
            />
          </div>
          <CalendarLegend />
        </div>

        <DisplaySidePanel
          events={events}
          onEventClick={openEventDetails}
          onQuickAdd={openAddEvent}
        />
      </main>

      <EventDetailsModal
        event={selectedEvent ?? null}
        open={!!selectedEvent}
        onClose={() => setDetailsEventId(null)}
        onEdit={() => selectedEvent && openEditEvent(selectedEvent.id)}
        onDelete={() => selectedEvent && setDeleteTarget(selectedEvent)}
      />

      <EventFormModal
        open={formOpen}
        mode={formMode}
        initialForm={editEvent ? formFromEvent(editEvent) : undefined}
        prefill={formMode === "add" ? addPrefill : undefined}
        onSave={handleFormSave}
        onCancel={() => {
          setFormOpen(false);
          setEditEventId(null);
          setAddPrefill(undefined);
        }}
      />

      <ConfirmActionModal
        open={!!deleteTarget}
        type="delete"
        event={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmActionModal
        open={!!pendingMove}
        type="move"
        event={pendingMove?.newEvent ?? null}
        oldEvent={pendingMove?.oldEvent}
        newEvent={pendingMove?.newEvent}
        onConfirm={handleMoveConfirm}
        onCancel={() => setPendingMove(null)}
      />

      <ConfirmActionModal
        open={!!pendingResize}
        type="resize"
        event={pendingResize?.newEvent ?? null}
        oldEvent={pendingResize?.oldEvent}
        newEvent={pendingResize?.newEvent}
        onConfirm={handleResizeConfirm}
        onCancel={() => setPendingResize(null)}
      />

      <ConflictModal
        open={!!conflict}
        event={conflict?.event ?? null}
        conflicts={conflict?.conflicts ?? []}
        onSaveAnyway={handleConflictSaveAnyway}
        onCancel={() => setConflict(null)}
      />

      {undo && (
        <UndoToast message={undo.message} onUndo={performUndo} onDismiss={dismissUndo} />
      )}

      <span className="sr-only" data-display-id={displayId}>
        Display {displayId}
      </span>
    </div>
  );
}
