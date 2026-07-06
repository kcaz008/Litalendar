"use client";

import {
  DATE_PRESETS,
  DURATION_PRESETS,
  TIME_PRESETS,
  TITLE_PRESETS,
  addMinutes,
  combineDateAndTime,
  defaultAddForm,
  parseTimeKey,
  toIso,
  type AddEventPrefill,
} from "@/lib/events/utils";
import type { CalendarSource } from "@/types/calendar";
import { useEffect, useState } from "react";
import { Modal } from "./Modal";

export interface EventFormData {
  id?: string;
  title: string;
  calendarId: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  notes: string;
}

interface EventFormModalProps {
  open: boolean;
  mode: "add" | "edit";
  calendars: CalendarSource[];
  initialForm?: EventFormData;
  prefill?: AddEventPrefill;
  onSave: (form: EventFormData) => void;
  onCancel: () => void;
}

export function EventFormModal({
  open,
  mode,
  calendars,
  initialForm,
  prefill,
  onSave,
  onCancel,
}: EventFormModalProps) {
  const defaultCalendarId = calendars[0]?.id ?? "family";

  const [form, setForm] = useState<EventFormData>(() => {
    const base = initialForm ?? defaultAddForm(prefill);
    return { ...base, calendarId: base.calendarId || defaultCalendarId };
  });

  useEffect(() => {
    if (open) {
      const base = initialForm ?? defaultAddForm(prefill);
      setForm({ ...base, calendarId: base.calendarId || defaultCalendarId });
    }
  }, [open, initialForm, prefill, defaultCalendarId]);

  const setDuration = (minutes: number) => {
    if (form.allDay) return;
    const start = combineDateAndTime(form.date, form.startTime);
    const end = addMinutes(start, minutes);
    setForm((f) => ({ ...f, endTime: parseTimeKey(toIso(end)) }));
  };

  const adjustDuration = (deltaMinutes: number) => {
    if (form.allDay) return;
    const start = combineDateAndTime(form.date, form.startTime);
    const end = combineDateAndTime(form.date, form.endTime);
    const current = Math.max(15, (end.getTime() - start.getTime()) / 60_000);
    const newDuration = Math.max(15, current + deltaMinutes);
    const newEnd = addMinutes(start, newDuration);
    setForm((f) => ({ ...f, endTime: parseTimeKey(toIso(newEnd)) }));
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={mode === "add" ? "Add Event" : "Edit Event"}
      size="xl"
      footer={
        <>
          <button type="button" onClick={onCancel} className="touch-btn-secondary !px-8">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!form.title.trim()}
            className="touch-btn-primary !px-8 disabled:opacity-40"
          >
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        {/* Title */}
        <section>
          <label className="form-label" htmlFor="event-title">
            Title
          </label>
          <input
            id="event-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="form-input"
            placeholder="What's happening?"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {TITLE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setForm((f) => ({ ...f, title: preset }))}
                className={`preset-chip ${form.title === preset ? "preset-chip-active" : ""}`}
              >
                {preset}
              </button>
            ))}
          </div>
        </section>

        {/* Calendar */}
        <section>
          <p className="form-label">Calendar</p>
          <div className="flex flex-wrap gap-3">
            {calendars.map((cal) => (
              <button
                key={cal.id}
                type="button"
                onClick={() => setForm((f) => ({ ...f, calendarId: cal.id }))}
                className={`calendar-chip ${form.calendarId === cal.id ? "calendar-chip-active" : ""}`}
                style={
                  form.calendarId === cal.id
                    ? { borderColor: cal.backgroundColor, backgroundColor: `${cal.backgroundColor}33` }
                    : undefined
                }
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cal.backgroundColor }}
                  aria-hidden="true"
                />
                {cal.name}
              </button>
            ))}
          </div>
        </section>

        {/* Date */}
        <section>
          <p className="form-label">Date</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {DATE_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setForm((f) => ({ ...f, date: preset.getValue() }))}
                className={`preset-chip ${form.date === preset.getValue() ? "preset-chip-active" : ""}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="form-input"
          />
        </section>

        {/* Time */}
        {!form.allDay && (
          <section>
            <p className="form-label">Time</p>
            <div className="mb-3 flex flex-wrap gap-2">
              {TIME_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      startTime: preset.startTime,
                      endTime: preset.endTime,
                    }))
                  }
                  className="preset-chip"
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, allDay: true, startTime: "00:00", endTime: "23:59" }))
                }
                className="preset-chip"
              >
                All day
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-white/50" htmlFor="start-time">
                  Start
                </label>
                <input
                  id="start-time"
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="form-input"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm text-white/50" htmlFor="end-time">
                  End
                </label>
                <input
                  id="end-time"
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="form-input"
                />
              </div>
            </div>
          </section>
        )}

        {form.allDay && (
          <section>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, allDay: false, startTime: "09:00", endTime: "10:00" }))}
              className="preset-chip preset-chip-active"
            >
              All day ✓ — tap to set specific times
            </button>
          </section>
        )}

        {/* Duration */}
        {!form.allDay && (
          <section>
            <p className="form-label">Duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setDuration(preset.minutes)}
                  className="preset-chip"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            {mode === "edit" && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => adjustDuration(-15)} className="preset-chip">
                  −15 min
                </button>
                <button type="button" onClick={() => adjustDuration(15)} className="preset-chip">
                  +15 min
                </button>
                <button type="button" onClick={() => adjustDuration(30)} className="preset-chip">
                  +30 min
                </button>
                <button type="button" onClick={() => adjustDuration(60)} className="preset-chip">
                  +1 hour
                </button>
              </div>
            )}
          </section>
        )}

        {/* Location */}
        <section>
          <label className="form-label" htmlFor="event-location">
            Location <span className="text-white/30">(optional)</span>
          </label>
          <input
            id="event-location"
            type="text"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className="form-input"
            placeholder="Where?"
          />
        </section>

        {/* Notes */}
        <section>
          <label className="form-label" htmlFor="event-notes">
            Notes <span className="text-white/30">(optional)</span>
          </label>
          <textarea
            id="event-notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="form-input min-h-[100px] resize-none"
            placeholder="Any details..."
            rows={3}
          />
        </section>
      </div>
    </Modal>
  );
}
