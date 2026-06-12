"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { LayoutList, LayoutGrid, Filter, X } from "lucide-react";
import { useTasks } from "@/hooks/queries";
import { TaskRow } from "./task-card";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, EmptyState } from "@/components/ui/forms";
import { Skeleton } from "@/components/ui/index";
import { cn } from "@/lib/utils";
import type { TaskWithRelations, Project, User, TaskStatus, TaskPriority } from "@/types";

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "In Review", value: "in_review" },
  { label: "Done", value: "done" },
];

const PRIORITY_OPTIONS = [
  { label: "All Priorities", value: "" },
  { label: "Urgent", value: "urgent" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

interface TasksClientProps {
  initialTasks: TaskWithRelations[];
  projects: Project[];
  users: User[];
  initialFilters: { status?: string; priority?: string; projectId?: string; search?: string };
}

export function TasksClient({ initialTasks, projects, users, initialFilters }: TasksClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [view, setView] = useState<"list" | "grid">("list");
  const [localSearch, setLocalSearch] = useState(initialFilters.search ?? "");

  // Client-side data — synced with URL params
  // Falls back to server-provided initialTasks if query hasn't run
  const { data, isLoading } = useTasks({
    status: initialFilters.status ? [initialFilters.status as TaskStatus] : undefined,
    priority: initialFilters.priority ? [initialFilters.priority as TaskPriority] : undefined,
    projectId: initialFilters.projectId ? [initialFilters.projectId] : undefined,
    search: initialFilters.search,
  });
  const tasks = data?.data ?? initialTasks;

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    // LEARNING: startTransition marks URL update as non-urgent
    // so the current UI stays interactive during navigation
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    startTransition(() => router.push(pathname));
    setLocalSearch("");
  };

  const hasFilters = !!(initialFilters.status || initialFilters.priority || initialFilters.projectId || initialFilters.search);

  const projectOptions = [
    { label: "All Projects", value: "" },
    ...projects.map((p) => ({ label: p.name, value: p.id })),
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-slate-200 bg-white">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />

        <Input
          placeholder="Search tasks..."
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            // Debounce would go here in production
            updateFilter("search", e.target.value);
          }}
          className="h-8 w-52 text-xs"
        />

        <Select
          options={STATUS_OPTIONS}
          value={initialFilters.status ?? ""}
          onChange={(v) => updateFilter("status", v)}
          className="w-36"
        />

        <Select
          options={PRIORITY_OPTIONS}
          value={initialFilters.priority ?? ""}
          onChange={(v) => updateFilter("priority", v)}
          className="w-36"
        />

        <Select
          options={projectOptions}
          value={initialFilters.projectId ?? ""}
          onChange={(v) => updateFilter("projectId", v)}
          className="w-40"
        />

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <X className="h-3.5 w-3.5 mr-1" />
            Clear
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("list")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tasks */}
      <div className={cn("flex-1 overflow-auto", view === "grid" ? "p-5" : "")}>
        {isLoading || isPending ? (
          <TasksSkeleton view={view} />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Try adjusting your filters or create a new task."
          />
        ) : view === "list" ? (
          <div className="bg-white">
            {/* List header */}
            <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 text-xs font-medium text-slate-400 uppercase tracking-wide">
              <span className="w-4" />
              <span className="w-4" />
              <span className="flex-1">Title</span>
              <span className="hidden md:block w-32">Project</span>
              <span className="hidden sm:block w-8">Assignee</span>
              <span className="hidden md:block w-24">Due</span>
              <span className="hidden lg:block w-20 text-right">Updated</span>
            </div>
            {tasks.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {tasks.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function TasksSkeleton({ view }: { view: "list" | "grid" }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1,2,3,4,5,6].map((i) => (
          <div key={i} className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2.5">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="bg-white">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 flex-1 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      ))}
    </div>
  );
}
