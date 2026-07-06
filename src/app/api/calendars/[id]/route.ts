import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma, isDatabaseConfigured } from "@/lib/db/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const source = await prisma.calendarSource.findFirst({
    where: {
      id,
      googleConnection: { userId: session.userId },
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Calendar not found" }, { status: 404 });
  }

  const updated = await prisma.calendarSource.update({
    where: { id },
    data: {
      ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
      ...(body.name ? { name: body.name } : {}),
      ...(body.backgroundColor ? { backgroundColor: body.backgroundColor } : {}),
      ...(body.borderColor ? { borderColor: body.borderColor } : {}),
      ...(body.color ? { color: body.color } : {}),
    },
  });

  return NextResponse.json({ source: updated });
}
