// ============================================================
// CORE DOMAIN TYPES
// This file is the single source of truth for all domain types.
// API responses, store state, and component props all derive from here.
// ============================================================

export type ID = string;

// ── User ────────────────────────────────────────────────────

export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface User {
  id: ID;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: string;
  lastActiveAt: string;
}

// ── Workspace ───────────────────────────────────────────────

export interface Workspace {
  id: ID;
  name: string;
  slug: string;
  logo?: string;
  plan: "free" | "pro" | "enterprise";
  createdAt: string;
}

// ── Project ─────────────────────────────────────────────────

export type ProjectStatus = "active" | "archived" | "completed";

export interface Project {
  id: ID;
  name: string;
  description?: string;
  status: ProjectStatus;
  color: string;
  icon?: string;
  ownerId: ID;
  memberIds: ID[];
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

// ── Task ────────────────────────────────────────────────────

export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "cancelled";
export type TaskPriority = "urgent" | "high" | "medium" | "low" | "no_priority";

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: ID;
  assigneeId?: ID;
  creatorId: ID;
  labels: string[];
  estimate?: number; // story points
  dueDate?: string;
  completedAt?: string;
  order: number; // for kanban ordering
  createdAt: string;
  updatedAt: string;
}

export interface TaskWithRelations extends Task {
  project: Pick<Project, "id" | "name" | "color">;
  assignee?: Pick<User, "id" | "name" | "avatar">;
  creator: Pick<User, "id" | "name" | "avatar">;
}

// ── Comment ─────────────────────────────────────────────────

export interface Comment {
  id: ID;
  content: string;
  taskId: ID;
  authorId: ID;
  author: Pick<User, "id" | "name" | "avatar">;
  createdAt: string;
  updatedAt: string;
}

// ── Notification ────────────────────────────────────────────

export type NotificationType =
  | "task_assigned"
  | "task_comment"
  | "task_status_changed"
  | "project_invite"
  | "mention";

export interface Notification {
  id: ID;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  userId: ID;
  actorId: ID;
  actor: Pick<User, "id" | "name" | "avatar">;
  entityId: ID; // taskId or projectId
  entityType: "task" | "project";
  createdAt: string;
}

// ── Analytics ───────────────────────────────────────────────

export interface AnalyticsPeriod {
  label: string;
  tasks_completed: number;
  tasks_created: number;
  active_members: number;
}

export interface AnalyticsOverview {
  total_tasks: number;
  completed_tasks: number;
  active_projects: number;
  team_members: number;
  completion_rate: number;
  period_data: AnalyticsPeriod[];
  tasks_by_priority: Record<TaskPriority, number>;
  tasks_by_status: Record<TaskStatus, number>;
}

// ── API ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  errors?: Record<string, string[]>;
}

// ── Filters ─────────────────────────────────────────────────

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assigneeId?: ID[];
  projectId?: ID[];
  labels?: string[];
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  search?: string;
}

// ── Auth ────────────────────────────────────────────────────

export interface AuthUser extends User {
  workspace: Workspace;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  workspaceName: string;
}
