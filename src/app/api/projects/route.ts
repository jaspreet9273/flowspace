// ============================================================
// ROUTE HANDLER: /api/projects
// GET  - list projects (with optional filters)
// POST - create project
//
// LEARNING: Route Handlers run on the server. They have access
// to cookies, headers, and can do DB queries.
//
// For data that only Server Components read, you DON'T need a
// Route Handler — just query the DB directly in the component.
// Route Handlers exist for client-side mutations + fetches.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { mockProjects } from "@/lib/mock-data";
import type { Project } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search")?.toLowerCase();

  let projects = [...mockProjects];

  if (status) {
    projects = projects.filter((p) => p.status === status);
  }

  if (search) {
    projects = projects.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search)
    );
  }

  // Simulate latency
  await new Promise((r) => setTimeout(r, 100));

  return NextResponse.json({
    data: projects,
    total: projects.length,
    page: 1,
    limit: 50,
    hasMore: false,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: body.name,
      description: body.description,
      status: "active",
      color: body.color || "#6366f1",
      ownerId: "user_1",
      memberIds: ["user_1"],
      taskCount: 0,
      completedTaskCount: 0,
      dueDate: body.dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In production: INSERT INTO projects...
    mockProjects.push(newProject);

    return NextResponse.json({ data: newProject, message: "Project created" }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
}
