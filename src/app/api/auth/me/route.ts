import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ user: null, configured: false });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null, configured: true });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      googleConnection: { select: { id: true, updatedAt: true } },
      displays: { select: { id: true, slug: true, name: true } },
      appSettings: true,
    },
  });

  return NextResponse.json({
    configured: true,
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          hasGoogle: Boolean(user.googleConnection),
          displays: user.displays,
          settings: user.appSettings,
        }
      : null,
  });
}
