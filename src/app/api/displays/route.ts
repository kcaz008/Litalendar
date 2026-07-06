import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";
import { getDisplayUrl } from "@/lib/db/display";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const displays = await prisma.display.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    displays: displays.map((d) => ({
      ...d,
      url: getDisplayUrl(d.slug, d.privateKey),
      privateKey: d.privateKey,
    })),
  });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { generateDisplaySlug, generatePrivateKey } = await import("@/lib/db/display");

  const name = body.name || "Kitchen Display";
  let slug = body.slug || generateDisplaySlug(name);

  const existing = await prisma.display.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  const display = await prisma.display.create({
    data: {
      userId: session.userId,
      slug,
      name,
      privateKey: generatePrivateKey(),
      editingEnabled: body.editingEnabled ?? true,
    },
  });

  return NextResponse.json({
    display: {
      ...display,
      url: getDisplayUrl(display.slug, display.privateKey),
    },
  });
}
