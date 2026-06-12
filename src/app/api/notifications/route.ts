import { NextRequest, NextResponse } from "next/server";
import { mockNotifications } from "@/lib/mock-data";

export async function GET() {
  await new Promise((r) => setTimeout(r, 80));
  return NextResponse.json({ data: mockNotifications });
}
