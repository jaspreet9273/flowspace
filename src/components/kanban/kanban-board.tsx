"use client";

// ============================================================
// KANBAN BOARD
//
// LEARNING: This is a pure Client Component — it manages complex
// drag-and-drop UI state that cannot exist on the server.
// It receives initial data as props from the Server Component
// page, then uses TanStack Query for updates.
//
// Pattern: Server Component fetches → passes to Client Component
// ============================================================

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_STATUS_CONFIG } from "@/lib/utils";
import { TaskCard } from "@/components/tasks/task-card";
import { useUpdateTask } from "@/hooks/queries";
import { useUIStore } from "@/stores/ui.store";
import { Button } from "@/components/ui/button";
import type { TaskWithRelations, TaskStatus } from "@/types";

const KANBAN_COLUMNS: TaskStatus[] = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "done",
];

interface KanbanBoardProps {
  tasks: TaskWithRelations[];
}

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  const { mutate: updateTask } = useUpdateTask();
  const { openModal } = useUIStore();
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  // Group tasks by status
  const columnTasks: Record<TaskStatus, TaskWithRelations[]> = {
    backlog: [],
    todo: [],
    in_progress: [],
    in_review: [],
    done: [],
    cancelled: [],
  };
  for (const task of tasks) {
    if (columnTasks[task.status]) {
      columnTasks[task.status].push(task);
    }
  }

  const handleDrop = (targetStatus: TaskStatus) => {
    if (!draggedTaskId || draggedTaskId === targetStatus) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.status === targetStatus) return;

    updateTask({ id: draggedTaskId, data: { status: targetStatus } });
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-180px)]">
      {KANBAN_COLUMNS.map((status) => {
        const config = TASK_STATUS_CONFIG[status];
        const colTasks = columnTasks[status];
        const isOver = dragOverColumn === status;

        return (
          <div
            key={status}
            className="flex flex-col w-72 shrink-0"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(status);
            }}
            onDragLeave={() => setDragOverColumn(null)}
            onDrop={() => handleDrop(status)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded-full",
                    config.bgColor,
                    config.color,
                  )}
                >
                  {config.label}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {colTasks.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openModal("create-task")}
                className="text-slate-400 hover:text-slate-600"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Column body */}
            <div
              className={cn(
                "flex-1 space-y-2.5 rounded-lg p-2 min-h-50 transition-colors",
                isOver
                  ? "bg-indigo-50 border-2 border-dashed border-indigo-200"
                  : "bg-slate-100/60",
              )}
            >
              {colTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  compact
                  draggable
                  onDragStart={() => setDraggedTaskId(task.id)}
                />
              ))}

              {colTasks.length === 0 && !isOver && (
                <div className="flex items-center justify-center h-24">
                  <p className="text-xs text-slate-400">Drop tasks here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
