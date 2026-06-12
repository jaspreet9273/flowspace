import { NextRequest, NextResponse } from "next/server";
import { mockTasks, getTaskWithRelations } from "@/lib/mock-data";
import type { Task } from "@/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");
  const priorityParam = searchParams.get("priority");
  const projectIdParam = searchParams.get("projectId");
  const assigneeIdParam = searchParams.get("assigneeId");
  const search = searchParams.get("search")?.toLowerCase();
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "50");

  let tasks = [...mockTasks];

  if (statusParam) {
    const statuses = statusParam.split(",");
    tasks = tasks.filter((t) => statuses.includes(t.status));
  }
  if (priorityParam) {
    const priorities = priorityParam.split(",");
    tasks = tasks.filter((t) => priorities.includes(t.priority));
  }
  if (projectIdParam) {
    const projectIds = projectIdParam.split(",");
    tasks = tasks.filter((t) => projectIds.includes(t.projectId));
  }
  if (assigneeIdParam) {
    const assigneeIds = assigneeIdParam.split(",");
    tasks = tasks.filter((t) => t.assigneeId && assigneeIds.includes(t.assigneeId));
  }
  if (search) {
    tasks = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(search) ||
        t.description?.toLowerCase().includes(search)
    );
  }

  const total = tasks.length;
  const offset = (page - 1) * limit;
  const paginated = tasks.slice(offset, offset + limit);
  const tasksWithRelations = paginated.map(getTaskWithRelations);

  await new Promise((r) => setTimeout(r, 100));

  return NextResponse.json({
    data: tasksWithRelations,
    total,
    page,
    limit,
    hasMore: offset + limit < total,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: body.title,
      description: body.description,
      status: body.status || "todo",
      priority: body.priority || "medium",
      projectId: body.projectId,
      assigneeId: body.assigneeId || undefined,
      creatorId: "user_1",
      labels: body.labels || [],
      estimate: body.estimate,
      dueDate: body.dueDate,
      order: mockTasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockTasks.push(newTask);

    return NextResponse.json(
      { data: getTaskWithRelations(newTask), message: "Task created" },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
  }
}
