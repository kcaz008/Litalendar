"use client";

import { enrichEvent } from "@/lib/mock/events";
import type { FamilyEvent } from "@/types/calendar";
import { Modal } from "./Modal";

interface ConflictModalProps {
  open: boolean;
  event: FamilyEvent | null;
  conflicts: FamilyEvent[];
  onSaveAnyway: () => void;
  onCancel: () => void;
}

export function ConflictModal({
  open,
  event,
  conflicts,
  onSaveAnyway,
  onCancel,
}: ConflictModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="This overlaps another event"
      size="md"
      footer={
        <>
          <button type="button" onClick={onCancel} className="touch-btn-secondary !px-8">
            Cancel
          </button>
          <button type="button" onClick={onSaveAnyway} className="touch-btn-primary !px-8">
            Save Anyway
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-xl text-white/80">
          {event ? (
            <>
              <strong className="text-white">{event.title}</strong> overlaps with:
            </>
          ) : (
            "This event overlaps with:"
          )}
        </p>

        <ul className="flex flex-col gap-3">
          {conflicts.map((c) => {
            const enriched = enrichEvent(c);
            return (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4"
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: enriched.calendarColor }}
                  aria-hidden="true"
                />
                <span className="text-lg text-white">{c.title}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
