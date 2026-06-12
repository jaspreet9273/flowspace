import { NextResponse } from "next/server";
import { mockAnalytics } from "@/lib/mock-data";

export async function GET() {
  await new Promise((r) => setTimeout(r, 120));
  return NextResponse.json({ data: mockAnalytics });
}
