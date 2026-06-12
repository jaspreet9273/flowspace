# Data Fetching Patterns in Next.js App Router

> **Implementation**: `src/hooks/queries.ts`, `src/lib/api.ts`, all page files  
> **Interview relevance**: ⭐⭐⭐⭐⭐

---

## Overview: 5 Ways to Fetch Data

```
1. Server Component (direct)     → Best for initial page data
2. Route Handler + fetch()       → Best for client-side fetches
3. Server Actions                → Best for mutations from client
4. TanStack Query (client)       → Best for reactive, cached data
5. Suspense + async RSC          → Best for streaming
```

---

## 1. Server Component — Direct Fetch

The most efficient pattern. No API hop, no client JS needed.

```tsx
// app/(dashboard)/dashboard/page.tsx
export default async function DashboardPage() {
  // In production: replace with actual DB query
  // const tasks = await prisma.task.findMany({ where: { userId: session.userId } });
  
  // You can also fetch from external APIs:
  const res = await fetch("https://api.example.com/tasks", {
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    // Caching options:
    next: { revalidate: 60 },     // ISR: cache for 60 seconds
    // next: { tags: ["tasks"] },  // Tag for on-demand revalidation
    // cache: "no-store",           // Always fresh (SSR)
  });
  const tasks = await res.json();

  return <TaskList tasks={tasks} />;
}
```

**Why no API call needed?**: Server Components run in the same environment as your backend. Calling your own `/api/tasks` from a Server Component is an unnecessary extra network hop.

---

## 2. Route Handler + fetch() (Client-Side)

Used by TanStack Query hooks and any client component that needs to fetch data.

```typescript
// src/lib/api.ts
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}

export const tasksApi = {
  list: (filters) => request<PaginatedResponse<Task>>(`/tasks?${qs}`),
  create: (data) => request<Task>("/tasks", { method: "POST", body: JSON.stringify(data) }),
};
```

---

## 3. TanStack Query — Reactive Client-Side Data

```typescript
// src/hooks/queries.ts

// LEARNING: Query keys are the cache key. Same key = same cache entry.
// Hierarchical keys enable targeted invalidation.
export const queryKeys = {
  tasks: {
    all: ["tasks"],
    lists: () => [...queryKeys.tasks.all, "list"],
    list: (filters) => [...queryKeys.tasks.lists(), filters],
    detail: (id) => [...queryKeys.tasks.all, id],
  },
};

// Fetch
export function useTasks(filters) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => tasksApi.list(filters),
    staleTime: 60_000,  // Data fresh for 60s — no background refetch
  });
}

// Mutate with optimistic update
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => tasksApi.update(id, data),
    
    // 1. Cancel in-flight queries to prevent race conditions
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.lists() });
      
      // 2. Snapshot current state for rollback
      const snapshot = queryClient.getQueryData(queryKeys.tasks.lists());
      
      // 3. Optimistically update the cache
      queryClient.setQueriesData(
        { queryKey: queryKeys.tasks.lists() },
        (old) => ({
          ...old,
          data: old.data.map((t) => t.id === id ? { ...t, ...data } : t),
        })
      );
      
      return { snapshot }; // Returned as context
    },
    
    // 4. Rollback on error
    onError: (err, vars, context) => {
      queryClient.setQueryData(queryKeys.tasks.lists(), context.snapshot);
    },
    
    // 5. Always refetch after settle (ensure consistency)
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
}
```

---

## 4. Server Actions — Form Mutations

Server Actions are async functions that run on the server, callable from Client Components.

```tsx
// app/actions/task.ts
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";

const createTaskSchema = z.object({
  title: z.string().min(1),
  projectId: z.string(),
});

export async function createTask(formData: FormData) {
  const raw = Object.fromEntries(formData);
  const data = createTaskSchema.parse(raw);
  
  // Direct DB access — no API needed
  await db.task.create({ data });
  
  // Invalidate cached data
  revalidatePath("/tasks");
  revalidateTag("tasks");
}

// Client Component usage:
function TaskForm() {
  return (
    <form action={createTask}>  {/* Server Action as form action */}
      <input name="title" />
      <input name="projectId" />
      <button type="submit">Create</button>
    </form>
  );
}

// Or call programmatically:
function TaskButton() {
  async function handleClick() {
    "use server";
    await createTask(new FormData());
  }
  return <button onClick={handleClick}>Create</button>;
}
```

---

## 5. Parallel Data Fetching

```tsx
// ❌ Sequential — task2 waits for task1 (waterfall)
const task1 = await fetchTask1();
const task2 = await fetchTask2();

// ✅ Parallel — both fetch simultaneously
const [task1, task2] = await Promise.all([
  fetchTask1(),
  fetchTask2(),
]);

// ✅ Even better with Suspense — non-blocking parallel
export default function Page() {
  return (
    <>
      <Suspense fallback={<Skeleton />}>
        <TaskSection />   {/* Fetches independently */}
      </Suspense>
      <Suspense fallback={<Skeleton />}>
        <ProjectSection /> {/* Fetches independently */}
      </Suspense>
    </>
  );
}
```

---

## revalidatePath and revalidateTag

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// After a mutation, invalidate specific cached pages:
revalidatePath("/tasks");           // Revalidate the /tasks page
revalidatePath("/projects/[id]", "page");  // Specific page type

// Tag-based invalidation (more precise):
// When fetching:
const data = await fetch(url, { next: { tags: ["tasks"] } });

// When mutating:
revalidateTag("tasks"); // Invalidates ALL fetches tagged "tasks"
```

---

## Data Fetching Decision Matrix

| Need | Solution |
|------|---------|
| Initial page render | Server Component + direct DB |
| User-interactive UI updates | TanStack Query |
| Form submissions | Server Actions |
| Webhook receiver | Route Handler |
| Polling / real-time | TanStack Query `refetchInterval` |
| Auth-protected data | Server Component (reads cookie) |
| Cross-origin API with secrets | Route Handler (proxy) |

---

## Interview Notes

**Q: What's the waterfall problem and how does Next.js solve it?**
> A waterfall is when data fetches happen sequentially — fetch B can't start until fetch A completes. Next.js solves this with: (1) `Promise.all()` for parallel server fetches, (2) multiple independent `<Suspense>` boundaries that each fetch independently, (3) React's `use()` hook for deferred loading.

**Q: When would you use TanStack Query instead of just Server Components?**
> Server Components are great for initial data. TanStack Query is needed when: data should update without a page navigation (polling), you want optimistic UI (update before server confirms), you need cache sharing between unrelated components, or you need background refetching on window focus.

**Q: How do Server Actions differ from Route Handlers for mutations?**
> Server Actions can be called directly from Client Components without an API endpoint — no `fetch()` needed. They integrate with React's form primitives, support progressive enhancement, and automatically handle serialization. Route Handlers are better for webhooks, when you need custom headers/status codes, or when third-party services need to call your API.
