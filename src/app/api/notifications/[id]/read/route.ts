import { NextRequest, NextResponse } from "next/server";
import { mockNotifications } from "@/lib/mock-data";

// POST /api/notifications/[id]/read
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notif = mockNotifications.find((n) => n.id === id);
  if (!notif) return NextResponse.json({ message: "Not found" }, { status: 404 });
  notif.read = true;
  return NextResponse.json({ data: notif });
}
