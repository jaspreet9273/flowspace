"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Trash2, Archive, ExternalLink } from "lucide-react";
import { useProjects, useDeleteProject, useCreateProject } from "@/hooks/queries";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProjectSchema, type CreateProjectFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Card, Avatar, AvatarGroup, EmptyState, Progress } from "@/components/ui/index";
import { DropdownMenu } from "@/components/ui/forms";
import { PROJECT_COLORS, formatPercent, cn } from "@/lib/utils";
import type { Project, User } from "@/types";

interface ProjectsClientProps {
  initialProjects: Project[];
  users: User[];
}

export function ProjectsClient({ initialProjects, users }: ProjectsClientProps) {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showCreate, setShowCreate] = useState(false);

  // TanStack Query — initialData seeds the cache with server-fetched data
  // LEARNING: This avoids a double fetch on initial load
  const { data, isLoading } = useProjects();
  const projects = data?.data ?? initialProjects;

  const filtered = projects.filter((p) => {
    if (filter === "all") return true;
    return p.status === filter;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors",
                filter === f
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking work."
          action={
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4" /> New Project
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} users={users} />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function ProjectCard({ project, users }: { project: Project; users: User[] }) {
  const { mutate: deleteProject } = useDeleteProject();
  const members = users.filter((u) => project.memberIds.includes(u.id));
  const progress = project.taskCount > 0
    ? (project.completedTaskCount / project.taskCount) * 100
    : 0;

  return (
    <Card className="p-5 flex flex-col gap-3 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between">
        <Link href={`/projects/${project.id}`} className="flex items-center gap-2.5 group">
          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
          <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
            {project.name}
          </h3>
        </Link>
        <DropdownMenu
          trigger={
            <button className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          }
          items={[
            {
              label: "Open project",
              icon: <ExternalLink className="h-4 w-4" />,
              onClick: () => window.location.href = `/projects/${project.id}`,
            },
            {
              label: "Archive",
              icon: <Archive className="h-4 w-4" />,
              onClick: () => {},
              divider: true,
            },
            {
              label: "Delete",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => deleteProject(project.id),
              variant: "danger",
            },
          ]}
        />
      </div>

      {project.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {project.description}
        </p>
      )}

      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>{project.completedTaskCount}/{project.taskCount} tasks</span>
          <span>{formatPercent(progress)}</span>
        </div>
        <Progress value={progress} />
      </div>

      <div className="flex items-center justify-between pt-1">
        <AvatarGroup users={members} max={4} size="xs" />
        {project.dueDate && (
          <span className="text-xs text-slate-400">
            Due {new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        )}
      </div>
    </Card>
  );
}

function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const { mutate: createProject, isPending } = useCreateProject();
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { color: PROJECT_COLORS[0] },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createProject({ ...data, color: selectedColor }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md mx-4 bg-white rounded-xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-semibold text-slate-900 mb-5">New Project</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Project name" required error={errors.name?.message} htmlFor="pname">
            <Input id="pname" placeholder="e.g. Website Redesign" autoFocus {...register("name")} />
          </FormField>

          <FormField label="Description" error={errors.description?.message}>
            <Textarea placeholder="What is this project about?" rows={2} {...register("description")} />
          </FormField>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Color</p>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    "h-7 w-7 rounded-full transition-transform hover:scale-110",
                    selectedColor === color && "ring-2 ring-offset-2 ring-slate-400"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <FormField label="Due date" error={errors.dueDate?.message} htmlFor="dueDate">
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </FormField>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={isPending}>Create Project</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
