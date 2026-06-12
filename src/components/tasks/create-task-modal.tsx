"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { createTaskSchema, type CreateTaskFormData } from "@/lib/validations";
import { useCreateTask, useProjects, useUsers } from "@/hooks/queries";
import { useUIStore } from "@/stores/ui.store";
import { Button } from "@/components/ui/button";
import { Input, Textarea, FormField } from "@/components/ui/input";
import { Select, Switch } from "@/components/ui/forms";
import type { TaskStatus, TaskPriority } from "@/types";

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "In Review", value: "in_review" },
  { label: "Done", value: "done" },
];

const PRIORITY_OPTIONS: { label: string; value: TaskPriority }[] = [
  { label: "Urgent", value: "urgent" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
  { label: "No Priority", value: "no_priority" },
];

export function CreateTaskModal() {
  const { activeModal, closeModal, modalPayload } = useUIStore();
  const { mutate: createTask, isPending } = useCreateTask();
  const { data: projectsData } = useProjects();
  const { data: usersData } = useUsers();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      status: "todo",
      priority: "medium",
      projectId: (modalPayload?.projectId as string) || "",
    },
  });

  const onSubmit = (data: CreateTaskFormData) => {
    createTask(data, {
      onSuccess: () => {
        reset();
        closeModal();
      },
    });
  };

  if (activeModal !== "create-task") return null;

  const projects = projectsData?.data ?? [];
  const users = usersData?.data ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-white rounded-xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Create Task</h2>
          <button
            onClick={closeModal}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Title */}
          <FormField label="Title" required error={errors.title?.message} htmlFor="title">
            <Input
              id="title"
              placeholder="Task title..."
              {...register("title")}
              error={errors.title?.message}
              autoFocus
            />
          </FormField>

          {/* Description */}
          <FormField label="Description" error={errors.description?.message}>
            <Textarea
              placeholder="Add more detail..."
              rows={3}
              {...register("description")}
            />
          </FormField>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Status" required error={errors.status?.message}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    options={STATUS_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>

            <FormField label="Priority" required error={errors.priority?.message}>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select
                    options={PRIORITY_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </FormField>
          </div>

          {/* Row: Project + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Project" required error={errors.projectId?.message}>
              <Controller
                name="projectId"
                control={control}
                render={({ field }) => (
                  <Select
                    options={projects.map((p) => ({ label: p.name, value: p.id }))}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select project"
                  />
                )}
              />
            </FormField>

            <FormField label="Assignee">
              <Controller
                name="assigneeId"
                control={control}
                render={({ field }) => (
                  <Select
                    options={[
                      { label: "Unassigned", value: "" },
                      ...users.map((u) => ({ label: u.name, value: u.id })),
                    ]}
                    value={field.value || ""}
                    onChange={(v) => field.onChange(v || undefined)}
                    placeholder="Unassigned"
                  />
                )}
              />
            </FormField>
          </div>

          {/* Due date */}
          <FormField label="Due Date" error={errors.dueDate?.message} htmlFor="dueDate">
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </FormField>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={isPending}>
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
