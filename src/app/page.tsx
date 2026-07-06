import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-[#0a0e1a] via-[#12182b] to-[#0d1220] p-8 text-center">
      <div className="max-w-lg">
        <h1 className="font-display text-5xl font-semibold text-white">Litalendar</h1>
        <p className="mt-4 text-lg text-white/60">
          A beautiful touch-first family calendar for Echo Show 15
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href="/setup"
          className="touch-btn-primary rounded-2xl px-10 py-4 text-xl"
        >
          Connect Google Calendars
        </Link>
        <Link
          href="/display/kitchen"
          className="touch-btn-secondary rounded-2xl px-10 py-4 text-xl"
        >
          Demo (mock data)
        </Link>
      </div>

      <p className="text-sm text-white/30">
        Phases 3–4 — Setup, Google OAuth, and live calendar fetching
      </p>
    </main>
  );
}
