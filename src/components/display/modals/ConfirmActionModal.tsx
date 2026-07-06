"use client";

import { formatDateLong, formatDateTimeLong, formatDuration } from "@/lib/events/utils";
import type { FamilyEvent } from "@/types/calendar";
import { Modal } from "./Modal";

export type ConfirmActionType = "delete" | "move" | "resize";

interface ConfirmActionModalProps {
  open: boolean;
  type: ConfirmActionType;
  event: FamilyEvent | null;
  oldEvent?: FamilyEvent;
  newEvent?: FamilyEvent;
  onConfirm: () => void;
  onCancel: () => void;
}

const TITLES: Record<ConfirmActionType, string> = {
  delete: "Delete this event?",
  move: "Confirm move",
  resize: "Confirm duration change",
};

const CONFIRM_LABELS: Record<ConfirmActionType, string> = {
  delete: "Delete",
  move: "Save Move",
  resize: "Save Duration",
};

export function ConfirmActionModal({
  open,
  type,
  event,
  oldEvent,
  newEvent,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  if (!event && type === "delete") return null;

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={TITLES[type]}
      size="md"
      footer={
        <>
          <button type="button" onClick={onCancel} className="touch-btn-secondary !px-8">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={type === "delete" ? "touch-btn-danger !px-8" : "touch-btn-primary !px-8"}
          >
            {CONFIRM_LABELS[type]}
          </button>
        </>
      }
    >
      {type === "delete" && event && (
        <div className="flex flex-col gap-4">
          <p className="text-xl text-white/80">
            Are you sure you want to delete <strong className="text-white">{event.title}</strong>?
          </p>
          <p className="text-lg text-white/50">{formatDateLong(event.start)}</p>
        </div>
      )}

      {type === "move" && oldEvent && newEvent && (
        <div className="flex flex-col gap-6">
          <ChangeBlock label="From" event={oldEvent} />
          <div className="text-center text-2xl text-white/30" aria-hidden="true">
            ↓
          </div>
          <ChangeBlock label="To" event={newEvent} />
        </div>
      )}

      {type === "resize" && oldEvent && newEvent && (
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/40">
              Previous
            </p>
            <p className="text-xl text-white">
              {formatDateTimeLong(oldEvent.start)} – {formatDateTimeLong(oldEvent.end)}
            </p>
            <p className="mt-1 text-lg text-white/50">
              {formatDuration(oldEvent.start, oldEvent.end, oldEvent.allDay)}
            </p>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/40">New</p>
            <p className="text-xl text-white">
              {formatDateTimeLong(newEvent.start)} – {formatDateTimeLong(newEvent.end)}
            </p>
            <p className="mt-1 text-lg text-emerald-300/80">
              {formatDuration(newEvent.start, newEvent.end, newEvent.allDay)}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}

function ChangeBlock({ label, event }: { label: string; event: FamilyEvent }) {
  return (
    <div className="rounded-2xl bg-white/5 px-6 py-5">
      <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/40">{label}</p>
      <p className="text-xl font-semibold text-white">{event.title}</p>
      <p className="mt-2 text-lg text-white/70">{formatDateTimeLong(event.start)}</p>
      <p className="text-lg text-white/50">to {formatDateTimeLong(event.end)}</p>
    </div>
  );
}
