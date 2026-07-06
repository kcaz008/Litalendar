import Link from "next/link";
import { isDatabaseConfigured } from "@/lib/db/prisma";
import { isGoogleConfigured } from "@/lib/google/oauth";

const ERROR_MESSAGES: Record<string, string> = {
  not_configured: "Google OAuth is not configured on the server.",
  auth_failed: "Google sign-in failed. Please try again.",
  invalid_state: "Security check failed. Please try again.",
  missing_code: "Authorization was incomplete. Please try again.",
  access_denied: "You declined Google access.",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, returnTo } = await searchParams;
  const dbReady = isDatabaseConfigured();
  const googleReady = isGoogleConfigured();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-white/60">
        Connect your Google account to import family calendars.
      </p>

      {!dbReady && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
          Database not configured. Add <code className="text-sm">DATABASE_URL</code> to your
          environment.
        </div>
      )}

      {!googleReady && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-200">
          Google OAuth not configured. Add{" "}
          <code className="text-sm">GOOGLE_CLIENT_ID</code> and{" "}
          <code className="text-sm">GOOGLE_CLIENT_SECRET</code>.
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
          {ERROR_MESSAGES[error] ?? `Error: ${error}`}
        </div>
      )}

      {dbReady && googleReady ? (
        <Link
          href={`/api/auth/google?returnTo=${encodeURIComponent(returnTo || "/setup")}`}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 text-lg font-medium text-gray-900"
        >
          <GoogleIcon />
          Continue with Google
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-8 w-full rounded-xl bg-white/20 px-6 py-4 text-lg font-medium text-white/40"
        >
          Continue with Google
        </button>
      )}

      <p className="mt-6 text-center text-sm text-white/40">
        Uses Google Calendar access to show and edit events. Tokens stay on the server.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
