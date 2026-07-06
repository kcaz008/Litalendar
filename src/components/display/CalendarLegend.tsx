import { MOCK_CALENDARS } from "@/lib/mock/events";

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4">
      {MOCK_CALENDARS.map((cal) => (
        <div key={cal.id} className="flex items-center gap-2">
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: cal.backgroundColor }}
            aria-hidden="true"
          />
          <span className="text-sm text-white/50">{cal.name}</span>
        </div>
      ))}
    </div>
  );
}
