import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/google/oauth";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  if (!isGoogleConfigured()) {
    return NextResponse.json({ error: "Google OAuth not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") || "/setup";

  // reconnect=1 re-runs OAuth with prompt=consent (see buildGoogleAuthUrl).
  // Do not delete GoogleConnection here — that cascades and wipes saved calendar selections.

  const state = randomBytes(16).toString("base64url");
  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, JSON.stringify({ state, returnTo }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(buildGoogleAuthUrl(state));
}
