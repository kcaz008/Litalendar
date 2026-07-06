import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0e1a] via-[#12182b] to-[#0d1220] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold">
            Litalendar
          </Link>
          <nav className="flex gap-4 text-sm text-white/60">
            <Link href="/setup" className="hover:text-white">
              Setup
            </Link>
            <Link href="/settings" className="hover:text-white">
              Settings
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8">{children}</main>
    </div>
  );
}
