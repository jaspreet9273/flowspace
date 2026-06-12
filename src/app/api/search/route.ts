// ============================================================
// ROUTE HANDLER: GET /api/search
//
// LEARNING: This demonstrates full-text search across multiple
// entity types. In production use pg_trgm, Elasticsearch,
// Typesense, or Algolia.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { mockTasks, mockProjects } from "@/lib/mock-data";
import type { SearchResult } from "@/lib/api";

export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get("q")?.toLowerCase() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ data: [] });
  }

  const results: SearchResult[] = [];

  // Search tasks
  for (const task of mockTasks) {
    if (
      task.title.toLowerCase().includes(q) ||
      task.description?.toLowerCase().includes(q)
    ) {
      const project = mockProjects.find((p) => p.id === task.projectId);
      results.push({
        type: "task",
        id: task.id,
        title: task.title,
        subtitle: project?.name,
        url: `/tasks/${task.id}`,
      });
    }
  }

  // Search projects
  for (const project of mockProjects) {
    if (
      project.name.toLowerCase().includes(q) ||
      project.description?.toLowerCase().includes(q)
    ) {
      results.push({
        type: "project",
        id: project.id,
        title: project.name,
        subtitle: project.description,
        url: `/projects/${project.id}`,
      });
    }
  }

  await new Promise((r) => setTimeout(r, 80));

  return NextResponse.json({ data: results.slice(0, 10) });
}
