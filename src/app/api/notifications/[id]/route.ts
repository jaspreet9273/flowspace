import { NextRequest, NextResponse } from "next/server";
import { mockNotifications } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notif = mockNotifications.find((n) => n.id === id);
  if (!notif) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json({ data: notif });
}
