"use client";

interface WeatherPlaceholderProps {
  className?: string;
}

export function WeatherPlaceholder({ className = "" }: WeatherPlaceholderProps) {
  return (
    <div className={`weather-card overflow-hidden ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-white/40">Weather</p>
          <p className="mt-1 font-display text-4xl font-semibold text-white">72°</p>
          <p className="mt-1 text-sm text-white/50">Partly sunny</p>
        </div>
        <span className="text-5xl" aria-hidden="true">
          ⛅
        </span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-white/[0.04] px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-white/35">High</p>
          <p className="mt-0.5 text-lg font-semibold text-white">78°</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-white/35">Low</p>
          <p className="mt-0.5 text-lg font-semibold text-white">62°</p>
        </div>
        <div className="rounded-xl bg-white/[0.04] px-3 py-2.5 text-center">
          <p className="text-[10px] uppercase tracking-wide text-white/35">Rain</p>
          <p className="mt-0.5 text-lg font-semibold text-sky-300">20%</p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-white/30">Weather setup coming soon</p>
    </div>
  );
}
