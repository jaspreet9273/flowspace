import { NextResponse } from "next/server";
import { mockNotifications } from "@/lib/mock-data";

export async function POST() {
  mockNotifications.forEach((n) => { n.read = true; });
  return NextResponse.json({ message: "All marked read" });
}
