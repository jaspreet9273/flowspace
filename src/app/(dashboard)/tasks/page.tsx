// ============================================================
// TASKS PAGE — Server Component + Client filters
//
// LEARNING: Search params are available in Server Components
// via the searchParams prop. This means filter state lives
// in the URL — shareable, bookmarkable, browser-back works.
//
// Pattern: Server reads URL params → fetches filtered data →
// passes to Client Component for interactive UI.
// ============================================================

import { mockTasksWithRelations, mockProjects, mockUsers } from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import { TasksClient } from "@/components/tasks/tasks-client";
import type { Metadata } from "next";
import type { TaskStatus, TaskPriority } from "@/types";

export const metadata: Metadata = { title: "Tasks" };

interface SearchParams {
  status?: string;
  priority?: string;
  projectId?: string;
  search?: string;
}

async function getTasks(filters: SearchParams) {
  let tasks = [...mockTasksWithRelations];

  if (filters.status) {
    const statuses = filters.status.split(",") as TaskStatus[];
    tasks = tasks.filter((t) => statuses.includes(t.status));
  }
  if (filters.priority) {
    const priorities = filters.priority.split(",") as TaskPriority[];
    tasks = tasks.filter((t) => priorities.includes(t.priority));
  }
  if (filters.projectId) {
    const projectIds = filters.projectId.split(",");
    tasks = tasks.filter((t) => projectIds.includes(t.projectId));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    tasks = tasks.filter((t) => t.title.toLowerCase().includes(q));
  }

  return tasks;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const tasks = await getTasks(params);

  return (
    <>
      <Header
        title="Tasks"
        description={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
      />
      <PageContainer className="!p-0">
        <TasksClient
          initialTasks={tasks}
          projects={mockProjects}
          users={mockUsers}
          initialFilters={params}
        />
      </PageContainer>
    </>
  );
}
