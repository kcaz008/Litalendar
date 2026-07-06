import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { signSessionToken, attachSessionCookie } from "@/lib/auth/session";
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  getAppUrl,
  isGoogleConfigured,
} from "@/lib/google/oauth";
import { getOrCreateAppSettings, getOrCreateDefaultDisplay } from "@/lib/db/display";
import { syncCalendarSourcesFromGoogle } from "@/lib/google/calendar";

const STATE_COOKIE = "google_oauth_state";

export async function GET(request: Request) {
  if (!isDatabaseConfigured() || !isGoogleConfigured()) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=not_configured`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=${error}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${getAppUrl()}/login?error=missing_code`);
  }

  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(STATE_COOKIE)?.value;
  cookieStore.delete(STATE_COOKIE);

  let returnTo = "/setup";
  if (stateCookie) {
    try {
      const parsed = JSON.parse(stateCookie) as { state: string; returnTo: string };
      if (parsed.state !== state) {
        return NextResponse.redirect(`${getAppUrl()}/login?error=invalid_state`);
      }
      returnTo = parsed.returnTo || "/setup";
    } catch {
      return NextResponse.redirect(`${getAppUrl()}/login?error=invalid_state`);
    }
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      create: {
        email: userInfo.email,
        name: userInfo.name,
        image: userInfo.picture,
      },
      update: {
        name: userInfo.name,
        image: userInfo.picture,
      },
    });

    await prisma.googleConnection.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope,
      },
      update: {
        accessToken: tokens.access_token,
        ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        expiresAt,
        scope: tokens.scope,
      },
    });

    await getOrCreateDefaultDisplay(user.id);
    await getOrCreateAppSettings(user.id);

    try {
      await syncCalendarSourcesFromGoogle(user.id);
    } catch (syncErr) {
      console.error("Calendar sync on login:", syncErr);
    }

    const token = await signSessionToken({ userId: user.id, email: user.email });
    const response = NextResponse.redirect(`${getAppUrl()}${returnTo}`);
    attachSessionCookie(response, token);
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${getAppUrl()}/login?error=auth_failed`);
  }
}
