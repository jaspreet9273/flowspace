import { NextRequest, NextResponse } from "next/server";
import { mockCurrentUser } from "@/lib/mock-data";

// GET /api/auth/me - get current session user
export async function GET(request: NextRequest) {
  const session = request.cookies.get("session");

  if (!session) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ data: mockCurrentUser });
}
