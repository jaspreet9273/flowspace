// ============================================================
// TANSTACK QUERY HOOKS
//
// These are the CLIENT-SIDE data fetching hooks.
// Used in Client Components that need reactive, cached data.
//
// LEARNING: When to use TanStack Query vs Server Components:
// - Server Component: initial page load, SEO-critical data
// - TanStack Query: interactive updates, polling, optimistic UI
//
// Query keys follow a hierarchical pattern:
// ["projects"] → all projects
// ["projects", id] → single project
// ["projects", id, "tasks"] → tasks for a project
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  projectsApi,
  tasksApi,
  notificationsApi,
  analyticsApi,
  usersApi,
  searchApi,
} from "@/lib/api";
import type { Project, Task, TaskFilters, TaskWithRelations } from "@/types";

// ── Query Keys ───────────────────────────────────────────────
// Centralised so invalidation is consistent everywhere.

export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    lists: () => [...queryKeys.projects.all, "list"] as const,
    list: (filters?: object) =>
      [...queryKeys.projects.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.projects.all, id] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (filters?: object) => [...queryKeys.tasks.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.tasks.all, id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
  },
  analytics: {
    overview: ["analytics", "overview"] as const,
  },
  users: {
    all: ["users"] as const,
    detail: (id: string) => [...queryKeys.users.all, id] as const,
  },
};

// ── Projects ─────────────────────────────────────────────────

export function useProjects(filters?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectsApi.list(filters),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Project>) => projectsApi.create(data),
    onSuccess: () => {
      // Invalidate all project lists so they refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsApi.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      queryClient.setQueryData(
        queryKeys.projects.detail(response.data.id),
        response,
      );
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(id) });
    },
  });
}

// ── Tasks ────────────────────────────────────────────────────

export function useTasks(
  filters?: TaskFilters & { page?: number; limit?: number },
) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => tasksApi.list(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Task>) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      tasksApi.update(id, data),
    // Optimistic update for kanban drag-and-drop
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.lists() });
      const previousData = queryClient.getQueriesData({
        queryKey: queryKeys.tasks.lists(),
      });

      queryClient.setQueriesData(
        { queryKey: queryKeys.tasks.lists() },
        (old: { data: TaskWithRelations[] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: old.data.map((t: TaskWithRelations) =>
              t.id === id ? { ...t, ...data } : t,
            ),
          };
        },
      );

      return { previousData };
    },
    onError: (_err, _vars, context) => {
      // Roll back optimistic update on error
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
  });
}

// ── Notifications ────────────────────────────────────────────

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => notificationsApi.list(),
    refetchInterval: 30_000, // Poll every 30s
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

// ── Analytics ────────────────────────────────────────────────

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: queryKeys.analytics.overview,
    queryFn: () => analyticsApi.overview(),
    staleTime: 5 * 60 * 1000, // 5 minutes — analytics don't need to be super fresh
  });
}

// ── Users ────────────────────────────────────────────────────

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => usersApi.list(),
    staleTime: 10 * 60 * 1000, // User list is stable
  });
}

// ── Search ───────────────────────────────────────────────────

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.search(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  });
}
