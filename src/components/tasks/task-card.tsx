"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/index";
import { StatusBadge, PriorityBadge, ProjectDot } from "./status-badge";
import type { TaskWithRelations } from "@/types";

interface TaskCardProps {
  task: TaskWithRelations;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: () => void;
}

export function TaskCard({
  task,
  compact = false,
  draggable,
  onDragStart,
}: TaskCardProps) {
  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    task.status !== "cancelled" &&
    new Date(task.dueDate) < new Date();

  return (
    <Link href={`/tasks/${task.id}`} className="block group">
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        className={cn(
          "rounded-lg border border-slate-200 bg-white p-3.5",
          "hover:border-indigo-300 hover:shadow-sm transition-all",
          "cursor-pointer",
          draggable && "cursor-grab active:cursor-grabbing",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Project + Priority row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ProjectDot color={task.project.color} />
            <span className="truncate max-w-30">{task.project.name}</span>
          </div>
          <PriorityBadge priority={task.priority} showLabel={false} />
        </div>

        {/* Title */}
        <p
          className={cn(
            "text-sm font-medium text-slate-900 leading-snug",
            task.status === "done" && "line-through text-slate-400",
            task.status === "cancelled" && "line-through text-slate-400",
          )}
        >
          {task.title}
        </p>

        {!compact && (
          <>
            {/* Status */}
            <div className="mt-2.5">
              <StatusBadge status={task.status} />
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <Avatar
                    src={task.assignee.avatar}
                    name={task.assignee.name}
                    size="xs"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-dashed border-slate-200" />
                )}
                {task.dueDate && (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      isOverdue ? "text-red-500" : "text-slate-400",
                    )}
                  >
                    <Calendar className="h-3 w-3" />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                {task.estimate && <span>{task.estimate}pt</span>}
                {task.labels.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-slate-600">
                    {task.labels[0]}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}

// ── Task Row (list view) ──────────────────────────────────────

export function TaskRow({ task }: { task: TaskWithRelations }) {
  const isOverdue =
    task.dueDate &&
    task.status !== "done" &&
    task.status !== "cancelled" &&
    new Date(task.dueDate) < new Date();

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors"
    >
      {/* Priority */}
      <PriorityBadge priority={task.priority} showLabel={false} />

      {/* Status */}
      <StatusBadge status={task.status} showLabel={false} />

      {/* Title */}
      <p
        className={cn(
          "flex-1 text-sm text-slate-900 truncate",
          (task.status === "done" || task.status === "cancelled") &&
            "line-through text-slate-400",
        )}
      >
        {task.title}
      </p>

      {/* Project */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 w-32 shrink-0">
        <ProjectDot color={task.project.color} />
        <span className="truncate">{task.project.name}</span>
      </div>

      {/* Assignee */}
      <div className="hidden sm:block w-8 shrink-0">
        {task.assignee ? (
          <Avatar
            src={task.assignee.avatar}
            name={task.assignee.name}
            size="xs"
          />
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-dashed border-slate-200" />
        )}
      </div>

      {/* Due date */}
      <div className="hidden md:block w-24 shrink-0">
        {task.dueDate && (
          <span
            className={cn(
              "text-xs",
              isOverdue ? "text-red-500" : "text-slate-400",
            )}
          >
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Updated */}
      <span className="hidden lg:block text-xs text-slate-400 w-20 shrink-0 text-right">
        {formatRelativeTime(task.updatedAt)}
      </span>
    </Link>
  );
}
