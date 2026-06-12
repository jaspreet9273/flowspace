// ============================================================
// KANBAN PAGE — Hybrid Server + Client
//
// LEARNING: Server Component fetches initial tasks, passes to
// KanbanBoard (Client Component) for drag-and-drop interaction.
// Status updates use TanStack Query optimistic mutations so
// cards snap to new columns instantly without waiting for API.
// ============================================================

import { mockTasksWithRelations } from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kanban" };

export default async function KanbanPage() {
  // Server-side fetch — arrives pre-populated
  const tasks = mockTasksWithRelations;

  return (
    <>
      <Header
        title="Kanban Board"
        description="Drag tasks between columns to update status"
      />
      <PageContainer className="overflow-hidden!">
        {/*
          KanbanBoard is a Client Component.
          It receives tasks as props (server data), then manages
          drag state locally and calls API for persistence.
        */}
        <KanbanBoard tasks={tasks} />
      </PageContainer>
    </>
  );
}
