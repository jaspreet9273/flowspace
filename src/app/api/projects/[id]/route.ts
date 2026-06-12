import { NextRequest, NextResponse } from "next/server";
import { mockProjects } from "@/lib/mock-data";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const project = mockProjects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ data: project });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = mockProjects.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  const body = await request.json();
  mockProjects[idx] = { ...mockProjects[idx], ...body, updatedAt: new Date().toISOString() };

  return NextResponse.json({ data: mockProjects[idx] });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idx = mockProjects.findIndex((p) => p.id === id);

  if (idx === -1) {
    return NextResponse.json({ message: "Project not found" }, { status: 404 });
  }

  mockProjects.splice(idx, 1);
  return new NextResponse(null, { status: 204 });
}
