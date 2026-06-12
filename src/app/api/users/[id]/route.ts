import { NextRequest, NextResponse } from "next/server";
import { mockUsers } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = mockUsers.find((u) => u.id === id);
  if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });
  return NextResponse.json({ data: user });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = mockUsers.findIndex((u) => u.id === id);
  if (idx === -1) return NextResponse.json({ message: "User not found" }, { status: 404 });
  const body = await request.json();
  mockUsers[idx] = { ...mockUsers[idx], ...body };
  return NextResponse.json({ data: mockUsers[idx] });
}
