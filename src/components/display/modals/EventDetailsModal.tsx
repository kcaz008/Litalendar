"use client";

import { enrichEvent, formatDateLong, formatTimeRange } from "@/lib/mock/events";
import type { FamilyEvent } from "@/types/calendar";
import { Modal } from "./Modal";

interface EventDetailsModalProps {
  event: FamilyEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventDetailsModal({
  event,
  open,
  onClose,
  onEdit,
  onDelete,
}: EventDetailsModalProps) {
  if (!event) return null;

  const enriched = enrichEvent(event);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={event.title}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onDelete} className="touch-btn-danger !px-8">
            Delete
          </button>
          <button type="button" onClick={onEdit} className="touch-btn-primary !px-8">
            Edit
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <span
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: enriched.calendarColor }}
            aria-hidden="true"
          />
          <span className="text-xl text-white/70">{enriched.calendarName}</span>
        </div>

        <DetailRow label="Date" value={formatDateLong(event.start)} />
        <DetailRow
          label="Time"
          value={formatTimeRange(event.start, event.end, event.allDay)}
        />
        {event.location && <DetailRow label="Location" value={event.location} />}
        {event.notes && (
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-wide text-white/40">
              Notes
            </p>
            <p className="rounded-xl bg-white/5 px-5 py-4 text-lg leading-relaxed text-white/80">
              {event.notes}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium uppercase tracking-wide text-white/40">{label}</p>
      <p className="text-xl text-white">{value}</p>
    </div>
  );
}
