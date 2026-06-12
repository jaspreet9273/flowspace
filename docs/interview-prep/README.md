# Next.js Interview Prep — Complete Question Bank

> Covers all topics for Senior Frontend / Full-Stack roles (~3 years experience)  
> Each question includes the answer a strong candidate would give.

---

## Section 1: App Router Fundamentals

### Q1: What is the App Router and how does it differ from the Pages Router?

**Strong answer:**
The App Router (Next.js 13+) is built on React Server Components. Key differences:

| | Pages Router | App Router |
|--|--|--|
| Default component type | Client | **Server** |
| Layouts | Manual wrapping | Nested, persistent |
| Data fetching | `getServerSideProps`, `getStaticProps` | `async/await` in components |
| Loading states | Manual | `loading.tsx` convention |
| Streaming | Not supported | Native with Suspense |
| Route groups | Not supported | `(folder)` syntax |

The mental model shift: everything is a Server Component unless you opt into client with `"use client"`.

---

### Q2: What is a React Server Component?

**Strong answer:**
RSCs are components that render exclusively on the server. Their code never ships to the browser, which means:
- Zero JS bundle impact
- Direct database/filesystem access
- Can use server-only secrets
- Cannot use hooks or browser APIs

They're NOT the same as SSR. SSR pre-renders Client Components to HTML then hydrates them. RSCs never hydrate — they render to a special RSC payload format and are reconciled into the existing tree without client-side re-execution.

---

### Q3: When do you use `"use client"`?

**Strong answer:**
Only when a component needs:
- React hooks (`useState`, `useEffect`, `useRef`, custom hooks)
- Browser APIs (`window`, `localStorage`, `navigator`)
- Event listeners (`onClick`, `onChange`)
- Third-party libraries that require browser APIs

**Common mistake**: Adding `"use client"` to parent components when only a child needs it. Push the boundary as deep as possible. Server Components can render Client Components as children — but NOT the other way around (you can't import a Server Component into a Client Component).

---

### Q4: Explain the rendering lifecycle of a page request in App Router

**Strong answer:**
1. **Request hits** Next.js server
2. **Middleware runs** (Edge Runtime) — auth checks, redirects
3. **Server Components render** — async, sequential or parallel with Suspense
4. **RSC payload generated** — a special format describing the UI tree
5. **HTML generated** from the RSC payload (for initial load)
6. **HTML streamed** to browser — Suspense boundaries flush progressively
7. **Browser displays HTML** immediately (no JS needed yet)
8. **React hydrates** — attaches to DOM, Client Components become interactive
9. **RSC payload used** by React for future navigations (no full page reload)

---

### Q5: What are Route Groups and when would you use them?

**Strong answer:**
Route Groups use `(parentheses)` in folder names. They organize routes without affecting URLs.

Use cases:
1. **Different layouts for different sections** — `(auth)/layout.tsx` for login pages, `(dashboard)/layout.tsx` for app pages, same URL structure
2. **Multiple root layouts** — `(marketing)/layout.tsx` with one HTML structure, `(app)/layout.tsx` with another
3. **Code organization** — group related routes without URL pollution
4. **Opt-in layouts** — some routes in a group need a layout, others don't

```
app/(marketing)/page.tsx    → /
app/(marketing)/about/page.tsx → /about
app/(app)/dashboard/page.tsx → /dashboard
// Different layouts, no "marketing" or "app" in URL
```

---

## Section 2: Rendering & Performance

### Q6: Explain SSR vs SSG vs ISR — when to use each

**Strong answer:**

**SSR** (Server-Side Rendering): Renders fresh HTML on every request.
- Use for: User-specific dashboards, real-time data, pages with auth
- Config: `export const dynamic = "force-dynamic"` or use cookies/headers

**SSG** (Static Site Generation): Renders HTML once at build time.
- Use for: Marketing pages, docs, blog posts that rarely change
- Config: No dynamic functions, or `export const dynamic = "force-static"`
- Benefit: Served from CDN, zero server load

**ISR** (Incremental Static Regeneration): Statically generated but periodically regenerated.
- Use for: Product pages, news articles, content updated occasionally
- Config: `export const revalidate = 3600` (seconds)
- On-demand: `revalidateTag("posts")` after CMS publish

---

### Q7: How does Streaming work? What problem does it solve?

**Strong answer:**
Without streaming: The server waits for ALL data to resolve before sending any HTML. If one query takes 2 seconds, the user sees nothing for 2 seconds.

With streaming: Next.js sends the HTML shell immediately. Each `<Suspense>` boundary is a "chunk" that gets sent to the browser as its async data resolves.

```tsx
export default function Page() {
  return (
    <Layout>            {/* Sent immediately */}
      <Header />        {/* Sent immediately */}
      
      <Suspense fallback={<Skeleton />}>
        <SlowComponent />  {/* Streamed when ready */}
      </Suspense>
    </Layout>
  );
}
```

This improves **TTFB** (first byte) and **FCP** (first content paint). Users see the page faster even if all data isn't ready.

---

### Q8: What is Partial Prerendering (PPR)?

**Strong answer:**
PPR combines static and dynamic in a single route. The static shell is pre-rendered at build time (served from CDN instantly). Dynamic "holes" are wrapped in Suspense and streamed.

The difference from regular SSR + Suspense: the static parts never hit the server — they come from the CDN edge. Only the dynamic parts require a server round-trip.

```tsx
// next.config.ts
experimental: { ppr: true }

// page.tsx
export default function Page() {
  return (
    <>
      <StaticNav />        {/* Prerendered — from CDN */}
      <StaticHero />       {/* Prerendered — from CDN */}
      <Suspense>
        <PersonalizedFeed /> {/* Streamed dynamically */}
      </Suspense>
    </>
  );
}
```

---

### Q9: What causes a hydration mismatch? How do you fix it?

**Strong answer:**
A hydration mismatch occurs when the HTML the server sends doesn't match what React renders client-side during hydration.

Common causes:
```tsx
// ❌ Date/time is different on server vs client
<p>{new Date().toLocaleTimeString()}</p>

// ❌ Checking window on server
<p>{typeof window !== "undefined" ? window.innerWidth : 0}</p>

// ❌ Random values
<p>{Math.random()}</p>
```

Fixes:
```tsx
// ✅ Use useEffect for client-only values
const [time, setTime] = useState("");
useEffect(() => setTime(new Date().toLocaleTimeString()), []);

// ✅ Use suppressHydrationWarning for intentional differences
<time suppressHydrationWarning>{new Date().toLocaleTimeString()}</time>

// ✅ dynamic() with ssr: false for browser-only components
const BrowserOnlyComponent = dynamic(() => import("./BrowserOnly"), { ssr: false });
```

---

## Section 3: Data Fetching & Caching

### Q10: Describe the four caches in Next.js App Router

**Strong answer:**

1. **Request Memoization**: Per-request, in-memory. Deduplicates identical `fetch()` calls in the same server render. Automatic — you don't configure it.

2. **Data Cache**: Persistent, cross-request. Caches `fetch()` responses on disk. Controlled with `cache:`, `next.revalidate`, and `next.tags`. Persists across deployments.

3. **Full Route Cache**: Server-side HTML + RSC payload cache. Stores the entire rendered output of static pages. Invalidated by `revalidatePath` or new deployment.

4. **Router Cache**: Client-side, in browser memory. Caches RSC payloads from navigations in current session. Makes back/forward navigation instant.

---

### Q11: When should you use TanStack Query instead of just Server Components?

**Strong answer:**
Server Components are ideal for **initial data fetch** — they render on the server with fresh data, no loading state.

Use TanStack Query when you need:
- **Mutations with optimistic updates** — task status drag-and-drop, instant UI feedback
- **Polling** — notification badge auto-updates every 30s
- **Cache sharing** — same task data displayed in multiple unrelated components
- **Background refetch** — data refreshes when user re-focuses the tab
- **Pagination/infinite scroll** — `useInfiniteQuery`
- **Manual cache invalidation** — after creating a task, invalidate `["tasks"]`

They're complementary: Server Components for initial load, TanStack Query for client-side reactivity.

---

### Q12: What is the difference between `revalidatePath` and `revalidateTag`?

**Strong answer:**
Both are called from Server Actions or Route Handlers to purge cached data.

`revalidatePath("/tasks")` — purges the Full Route Cache for that specific URL path. All `fetch()` calls on that page will re-run next request.

`revalidateTag("tasks")` — purges ALL `fetch()` calls tagged with `"tasks"`, regardless of which page they're on. More surgical.

```typescript
// Tagging the fetch:
const tasks = await fetch(url, { next: { tags: ["tasks", "user-123-tasks"] } });

// After mutation — invalidate by tag:
revalidateTag("tasks");      // All tasks everywhere
revalidateTag("user-123-tasks"); // Only this user's tasks
```

Use tags when the same data appears on multiple pages. Use path when you want to invalidate a specific page.

---

### Q13: Explain optimistic updates in TanStack Query

**Strong answer:**
Optimistic updates update the UI immediately (before the server responds), then reconcile once the server responds.

```typescript
useMutation({
  mutationFn: (data) => api.updateTask(data),
  
  onMutate: async (newData) => {
    // 1. Cancel any outgoing refetches (avoid race conditions)
    await queryClient.cancelQueries({ queryKey: ["tasks"] });
    
    // 2. Snapshot current cache (for rollback)
    const previous = queryClient.getQueryData(["tasks"]);
    
    // 3. Update cache immediately (optimistic)
    queryClient.setQueryData(["tasks"], (old) => ({
      ...old,
      data: old.data.map(t => t.id === newData.id ? { ...t, ...newData } : t)
    }));
    
    return { previous }; // Passes to onError
  },
  
  onError: (err, vars, context) => {
    // 4. Rollback on error
    queryClient.setQueryData(["tasks"], context.previous);
  },
  
  onSettled: () => {
    // 5. Always sync with server truth after mutation
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
  },
});
```

This makes drag-and-drop Kanban feel instant — the card snaps to the new column before the API responds.

---

## Section 4: Architecture & Patterns

### Q14: How do you share data between Server and Client Components?

**Strong answer:**
Server → Client: Pass as **props**. Server Components render Client Components and pass serializable data as props.

```tsx
// Server Component
async function Page() {
  const user = await db.user.findUnique(...); // Server-only
  return <UserProfile user={user} />; // Pass to Client Component
}

// Client Component receives as props
"use client";
function UserProfile({ user }) {
  const [editing, setEditing] = useState(false);
  // user arrived from server as props
}
```

Client → Server: **Server Actions** or **Route Handlers**.

```tsx
"use server";
async function updateUser(formData: FormData) {
  // Called from Client Component, runs on server
  await db.user.update(...);
}
```

You CANNOT import a Server Component into a Client Component. But you CAN pass Server Components as `children` props to Client Components:

```tsx
// Client Component that accepts Server Component children
"use client";
function ClientWrapper({ children }) {
  return <div onClick={handler}>{children}</div>;
}

// Server Component
function Page() {
  return (
    <ClientWrapper>
      <ServerOnlyData /> {/* This is fine! Passed as prop */}
    </ClientWrapper>
  );
}
```

---

### Q15: How does middleware work? What are its limitations?

**Strong answer:**
Middleware runs on the Edge Runtime before every matched request. It can: read/write cookies, set headers, redirect, rewrite URLs.

Limitations:
- **Edge Runtime only**: No Node.js APIs (`fs`, `crypto`, full ORM). Use `jose` for JWT verification, not `jsonwebtoken`.
- **No DB access**: Can't query a database directly (no Node APIs). Verify JWT from cookie instead of DB session lookup.
- **Runs on every request**: Without a `matcher` config, it runs on static assets too — very expensive.
- **No response body access**: Can't read request body in middleware.

```typescript
export const config = {
  // Critical: always configure matcher
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

### Q16: Explain the "Server Component as data-fetching layer" pattern

**Strong answer:**
Instead of using `useEffect` + `useState` for initial data:

```tsx
// ❌ Old pattern (Pages Router thinking)
"use client";
function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/tasks").then(r => r.json()).then(data => {
      setTasks(data);
      setLoading(false);
    });
  }, []);
  if (loading) return <Spinner />;
  return <TaskList tasks={tasks} />;
}
```

```tsx
// ✅ App Router pattern
// Server Component fetches directly
async function TasksPage() {
  const tasks = await db.task.findMany(); // No API call needed
  return <TaskList tasks={tasks} />;     // HTML arrives with data
}
```

Benefits: No loading spinner for initial data. HTML arrives pre-populated. No client JS. No API endpoint needed for server→server data.

---

### Q17: How do you handle errors in App Router?

**Strong answer:**

```
app/
├── error.tsx          ← Catches errors in page.tsx within same segment
├── global-error.tsx   ← Catches errors in root layout.tsx
└── not-found.tsx      ← Shown when notFound() is called
```

```tsx
// error.tsx — must be "use client" (React error boundaries are client)
"use client";
export default function Error({
  error,
  reset,  // Retry function — re-renders the segment
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// Trigger not-found:
import { notFound } from "next/navigation";
if (!project) notFound();
```

For async Server Component errors: They bubble up to the nearest `error.tsx`. The `digest` property is a server-side error hash for logging (the actual error message is hidden from client for security).

---

## Section 5: Zustand & State Management

### Q18: Why Zustand over Redux for a Next.js app?

**Strong answer:**
Redux has significant boilerplate (actions, reducers, selectors, Provider) and was designed before hooks. For a Next.js App Router app:

1. **No Provider needed**: Zustand stores are module-level singletons. No wrapping every Client Component tree.
2. **Selector performance**: `useStore(s => s.count)` only re-renders when `count` changes — not when anything in the store changes.
3. **SSR compatibility**: Zustand works with App Router's client/server split.
4. **Persistence built-in**: `persist` middleware for localStorage/sessionStorage.
5. **Bundle size**: ~1kb vs Redux Toolkit's ~40kb.

Redux Toolkit is still valid for very large teams with complex state, time-travel debugging needs, or when you have existing Redux codebases.

---

## Section 6: Quick-fire Round

**Q: What's `useTransition` used for?**
> Marks a state update as non-urgent. React can interrupt it to handle more urgent updates. Used in this project when updating URL search params for filters — the current UI stays responsive while navigation is pending.

**Q: What's the difference between `loading.tsx` and Suspense?**
> `loading.tsx` is an automatic Suspense boundary wrapping the `page.tsx` in the same segment. It's shown while the page's async Server Component resolves. Manual `<Suspense>` gives you finer control — you can wrap individual components within a page.

**Q: How does `generateMetadata` work?**
> It's an async function exported from page/layout that returns metadata. It runs on the server, can do async operations (DB queries), and receives the same `params` and `searchParams` as the page. It runs in parallel with the page render, not sequentially.

**Q: What is `unstable_cache`?**
> A Next.js function for caching arbitrary async functions (not just `fetch()`). Use it to cache database query results with the same revalidation semantics as fetch caching. Essential since ORMs like Prisma don't use `fetch()`.

```typescript
import { unstable_cache } from "next/cache";
const getCachedUser = unstable_cache(
  async (id) => db.user.findUnique({ where: { id } }),
  ["user"],
  { revalidate: 60, tags: ["users"] }
);
```

**Q: What happens to Zustand stores during SSR?**
> Zustand stores are module singletons — they're created once per Node.js process, not per request. This means if you mutate store state during SSR, it could leak between requests. Solution: use `createJSONStorage(() => sessionStorage)` for persistence (browser-only), and initialize stores from server-provided props via a Client Component like `AuthInitializer`.
