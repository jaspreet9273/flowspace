# Rendering Strategies in Next.js App Router

> **Implementation examples**: See `src/app/(dashboard)/` pages  
> **Interview relevance**: ⭐⭐⭐⭐⭐

---

## The Mental Model

Next.js doesn't force you to pick ONE rendering strategy for your whole app. You choose **per segment** (per route or even per component). The key question for each piece of UI is:

> *"Does this data change? How often? Does it need to be fast on first load?"*

---

## 1. React Server Components (RSC)

**Default for all components in App Router.**

```tsx
// src/app/(dashboard)/dashboard/page.tsx
// No "use client" → Server Component

export default async function DashboardPage() {
  // Direct DB access — no API call, no useEffect
  const tasks = await db.task.findMany({ where: { userId: currentUser.id } });
  
  return <TaskList tasks={tasks} />;
}
```

**What RSCs can do:**
- `async/await` at the top level
- Direct database queries
- Access environment variables
- Import server-only packages (fs, crypto, ORM)
- Reduce JS bundle size (RSC code never ships to browser)

**What RSCs CANNOT do:**
- Use hooks (`useState`, `useEffect`, `useRef`)
- Add event listeners (`onClick`, `onChange`)
- Use browser APIs (`window`, `localStorage`)
- Use React context

---

## 2. Client Components

```tsx
"use client"; // Must be at the very top — this file and imports become client bundles

import { useState } from "react";

export function KanbanBoard({ tasks }) {
  const [draggedId, setDraggedId] = useState(null);
  // ✅ useState works — this runs in the browser
  return <div onDragStart={() => setDraggedId(id)}>...</div>;
}
```

**Important**: `"use client"` marks a **boundary**, not a leaf. Everything imported into a `"use client"` file becomes client code too. Keep boundaries as deep in the tree as possible.

---

## 3. SSR (Server-Side Rendering)

```tsx
// No cache directives = SSR by default in App Router
// Every request gets fresh data from the server

export default async function TasksPage() {
  // Runs on server, on every request
  const tasks = await db.task.findMany();
  return <TaskList tasks={tasks} />;
}
```

**Use when**: Data changes frequently and needs to be fresh on every load (dashboard, feeds, user-specific data).

---

## 4. SSG (Static Site Generation)

```tsx
// Force static generation — pre-renders at build time
export const dynamic = "force-static";

// OR export no async functions and don't use dynamic data
export default function AboutPage() {
  return <StaticContent />;
}
```

**Use when**: Content doesn't change (marketing pages, docs, blogs). Zero runtime cost — just serves a file.

---

## 5. ISR (Incremental Static Regeneration)

```tsx
// Regenerate this page at most once every 60 seconds
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await fetchPosts(); // Cached for 60 seconds
  return <PostList posts={posts} />;
}
```

**How ISR works:**
1. Page is statically generated at build time
2. After `revalidate` seconds, next request triggers background regeneration
3. Old page is served while new one generates (stale-while-revalidate)

**Use when**: Data changes occasionally (product catalog, blog, pricing page).

---

## 6. Streaming with Suspense

```tsx
// src/app/(dashboard)/analytics/page.tsx

import { Suspense } from "react";

// This component fetches slowly
async function SlowChart() {
  await db.analytics.aggregate(/* complex query */);
  return <Chart data={data} />;
}

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      {/* Page shell renders immediately */}
      
      <Suspense fallback={<ChartSkeleton />}>
        {/* Streams in when SlowChart resolves */}
        <SlowChart />
      </Suspense>
    </div>
  );
}
```

**Why this matters**: Without Suspense, the entire page waits for the slowest query. With Suspense, the shell renders immediately and data streams in progressively. Users see content faster.

---

## 7. Partial Prerendering (PPR) — Next.js 14+

PPR combines static and dynamic in a single request:
- Static shell is pre-rendered at build time (instant)  
- Dynamic holes are filled by streaming (near-instant)

```tsx
// next.config.ts
import type { NextConfig } from "next";
const config: NextConfig = {
  experimental: { ppr: true }
};

// page.tsx
import { Suspense } from "react";
import { unstable_noStore as noStore } from "next/cache";

function DynamicFeed() {
  noStore(); // Opts this component out of static rendering
  return <UserFeed />;
}

export default function Page() {
  return (
    <div>
      <StaticHeader />        {/* Prerendered */}
      <StaticSidebar />       {/* Prerendered */}
      <Suspense fallback={<Skeleton />}>
        <DynamicFeed />       {/* Streamed dynamically */}
      </Suspense>
    </div>
  );
}
```

---

## Rendering Decision Tree

```
Is this UI interactive? (hooks, events, browser APIs)
├── YES → Client Component ("use client")
└── NO → Server Component (default)
    │
    └── Does the data change?
        ├── NO → SSG (export const dynamic = "force-static")
        ├── RARELY (hours/days) → ISR (export const revalidate = 3600)
        ├── FREQUENTLY → SSR (no revalidate)
        └── MIXED on same page → Streaming (Suspense boundaries)
```

---

## Hydration

**What is hydration?** The process of React "attaching" to server-rendered HTML in the browser. React doesn't re-render the whole page — it walks the existing DOM and adds event listeners.

**Hydration mismatch**: When server-rendered HTML doesn't match what React would render client-side. Common causes:
- Using `new Date()` or `Math.random()` in components
- Accessing `localStorage` during render
- Rendering different content based on `typeof window`

```tsx
// ❌ Causes hydration mismatch
function TimeDisplay() {
  return <p>{new Date().toLocaleTimeString()}</p>;
}

// ✅ Use useEffect for time-sensitive client state
function TimeDisplay() {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
  }, []);
  return <p>{time || "..."}</p>;
}
```

---

## Interview Notes

**Q: What's the difference between SSR and SSG?**
> SSG pre-renders at build time — the HTML exists before any user visits. SSR renders on each request. SSG is faster but stale; SSR is always fresh but adds server load. ISR bridges the gap.

**Q: How does streaming improve perceived performance?**
> Without streaming, the browser waits for the slowest query before showing anything. With streaming, the HTML shell arrives immediately and slow pieces (wrapped in `<Suspense>`) arrive progressively. TTFB improves and users see content faster.

**Q: What's the bundle size benefit of RSC?**
> Code in Server Components is never sent to the browser. A markdown parser, date formatter, or ORM used only in RSCs doesn't add to your JS bundle. This is impossible with the Pages Router where everything potentially becomes client code.

**Q: When does `"use client"` cause a problem?**
> When placed too high in the tree — it turns a large subtree into client code, negating RSC benefits. Keep it at the lowest component that actually needs browser APIs. Pass server data as props down to deep client components.
