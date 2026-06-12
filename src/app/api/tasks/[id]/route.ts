import { NextRequest, NextResponse } from "next/server";
import { mockTasks, getTaskWithRelations } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const task = mockTasks.find((t) => t.id === id);

  if (!task) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ data: getTaskWithRelations(task) });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = mockTasks.findIndex((t) => t.id === id);

  if (idx === -1) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  const body = await request.json();

  // Handle status change — set completedAt
  if (body.status === "done" && mockTasks[idx].status !== "done") {
    body.completedAt = new Date().toISOString();
  }

  mockTasks[idx] = { ...mockTasks[idx], ...body, updatedAt: new Date().toISOString() };

  return NextResponse.json({ data: getTaskWithRelations(mockTasks[idx]) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = mockTasks.findIndex((t) => t.id === id);

  if (idx === -1) {
    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  }

  mockTasks.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}
