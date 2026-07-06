"use client";

import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}

const SIZE_CLASS = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ open, onClose, title, children, footer, size = "lg" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div
        className={`relative flex max-h-[90vh] w-full ${SIZE_CLASS[size]} flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#141b2e]/95 shadow-glass-lg backdrop-blur-xl`}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-8 py-6">
          <h2 id="modal-title" className="font-display text-2xl font-semibold text-white">
            {title}
          </h2>
          <button type="button" onClick={onClose} className="touch-btn-secondary !min-h-[48px] !px-6">
            Close
          </button>
        </header>

        <div className="modal-scroll flex-1 overflow-y-auto px-8 py-6">{children}</div>

        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-white/10 px-8 py-6">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}
