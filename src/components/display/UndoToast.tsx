"use client";

interface UndoToastProps {
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div className="fixed bottom-8 left-1/2 z-[60] -translate-x-1/2">
      <div className="flex items-center gap-6 rounded-2xl border border-white/15 bg-[#1a2238]/95 px-8 py-5 shadow-glass-lg backdrop-blur-xl">
        <span className="text-xl font-medium text-white">{message}</span>
        <button type="button" onClick={onUndo} className="touch-btn-primary !min-h-[48px] !px-8">
          Undo
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="touch-btn-ghost !min-h-[48px] !px-4 text-white/50"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
