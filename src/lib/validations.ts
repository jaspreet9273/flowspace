import { z } from "zod";

// ── Auth Schemas ─────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    workspaceName: z.string().min(2, "Workspace name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ── Project Schemas ──────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(80, "Keep it under 80 characters"),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i, "Invalid color"),
  dueDate: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ── Task Schemas ─────────────────────────────────────────────

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Keep it under 200 characters"),
  description: z.string().max(5000).optional(),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done", "cancelled"]),
  priority: z.enum(["urgent", "high", "medium", "low", "no_priority"]),
  projectId: z.string().min(1, "Select a project"),
  assigneeId: z.string().optional(),
  dueDate: z.string().optional(),
  estimate: z.number().min(0).max(100).optional(),
  labels: z.array(z.string()).optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// ── Settings Schemas ─────────────────────────────────────────

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  bio: z.string().max(200).optional(),
});

export const workspaceSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
});

// ── Inferred types ───────────────────────────────────────────

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateProjectFormData = z.infer<typeof createProjectSchema>;
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type WorkspaceFormData = z.infer<typeof workspaceSchema>;
