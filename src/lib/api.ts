// ============================================================
// API CLIENT
// Typed fetch wrapper. Used by TanStack Query hooks.
// All client-side data fetching goes through this module.
//
// LEARNING NOTE: This is a Client Component concern.
// Server Components fetch directly — no API client needed.
// ============================================================

import type {
  ApiResponse,
  PaginatedResponse,
  Project,
  Task,
  TaskWithRelations,
  TaskFilters,
  Notification,
  AnalyticsOverview,
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthUser,
} from "@/types";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(res.status, error.message || "Request failed", error);
  }

  return res.json();
}

// ── Auth ─────────────────────────────────────────────────────

export const authApi = {
  login: (credentials: LoginCredentials) =>
    request<ApiResponse<AuthUser>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (credentials: RegisterCredentials) =>
    request<ApiResponse<AuthUser>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  logout: () => request<void>("/auth/logout", { method: "POST" }),

  me: () => request<ApiResponse<AuthUser>>("/auth/me"),
};

// ── Projects ─────────────────────────────────────────────────

export const projectsApi = {
  list: (filters?: { status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.search) params.set("search", filters.search);
    const qs = params.toString();
    return request<PaginatedResponse<Project>>(`/projects${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => request<ApiResponse<Project>>(`/projects/${id}`),

  create: (data: Partial<Project>) =>
    request<ApiResponse<Project>>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Project>) =>
    request<ApiResponse<Project>>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<void>(`/projects/${id}`, { method: "DELETE" }),
};

// ── Tasks ────────────────────────────────────────────────────

export const tasksApi = {
  list: (filters?: TaskFilters & { page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status?.length) params.set("status", filters.status.join(","));
    if (filters?.priority?.length) params.set("priority", filters.priority.join(","));
    if (filters?.projectId?.length) params.set("projectId", filters.projectId.join(","));
    if (filters?.assigneeId?.length) params.set("assigneeId", filters.assigneeId.join(","));
    if (filters?.search) params.set("search", filters.search);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return request<PaginatedResponse<TaskWithRelations>>(`/tasks${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => request<ApiResponse<TaskWithRelations>>(`/tasks/${id}`),

  create: (data: Partial<Task>) =>
    request<ApiResponse<TaskWithRelations>>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Task>) =>
    request<ApiResponse<TaskWithRelations>>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateStatus: (id: string, status: Task["status"]) =>
    request<ApiResponse<TaskWithRelations>>(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    request<void>(`/tasks/${id}`, { method: "DELETE" }),
};

// ── Notifications ────────────────────────────────────────────

export const notificationsApi = {
  list: () => request<ApiResponse<Notification[]>>("/notifications"),

  markRead: (id: string) =>
    request<void>(`/notifications/${id}/read`, { method: "POST" }),

  markAllRead: () =>
    request<void>("/notifications/read-all", { method: "POST" }),
};

// ── Analytics ────────────────────────────────────────────────

export const analyticsApi = {
  overview: () => request<ApiResponse<AnalyticsOverview>>("/analytics"),
};

// ── Users ────────────────────────────────────────────────────

export const usersApi = {
  list: () => request<ApiResponse<User[]>>("/users"),
  get: (id: string) => request<ApiResponse<User>>(`/users/${id}`),
  update: (id: string, data: Partial<User>) =>
    request<ApiResponse<User>>(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ── Search ───────────────────────────────────────────────────

export interface SearchResult {
  type: "task" | "project";
  id: string;
  title: string;
  subtitle?: string;
  url: string;
}

export const searchApi = {
  search: (query: string) =>
    request<ApiResponse<SearchResult[]>>(`/search?q=${encodeURIComponent(query)}`),
};

export { ApiError };
