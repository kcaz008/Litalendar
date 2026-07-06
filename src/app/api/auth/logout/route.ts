import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth/session";
import { getAppUrl } from "@/lib/google/oauth";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  await clearSession();
  return NextResponse.redirect(`${getAppUrl()}/login`);
}
