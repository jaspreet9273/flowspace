# App Router — Complete Guide

> **Implementation**: `src/app/` directory in this project  
> **Interview relevance**: ⭐⭐⭐⭐⭐ — asked in every senior Next.js interview

---

## What is the App Router?

The App Router is Next.js 13+'s file-system based routing built on top of React Server Components. Every file in `app/` is a **Server Component by default** — the most important mental shift from the Pages Router.

```
pages/       (old)        app/          (new)
──────────────────        ──────────────────────
pages/index.tsx    →      app/page.tsx
pages/about.tsx    →      app/about/page.tsx
pages/_layout.tsx  →      app/layout.tsx (nested)
pages/api/         →      app/api/ (Route Handlers)
```

---

## Special Files (Colocation Convention)

Each folder in `app/` can contain these reserved filenames:

| File            | Purpose                   | Server/Client        |
| --------------- | ------------------------- | -------------------- |
| `page.tsx`      | Unique UI for a route     | Server (default)     |
| `layout.tsx`    | Shared UI across children | Server (default)     |
| `loading.tsx`   | Suspense fallback         | Server               |
| `error.tsx`     | Error boundary            | **Client** (must be) |
| `not-found.tsx` | 404 UI                    | Server               |
| `template.tsx`  | Like layout but re-mounts | Server               |
| `route.ts`      | API endpoint              | Server               |

---

## Route Groups: `(auth)`, `(dashboard)`

```
app/
├── (auth)/             ← Route group — NO effect on URL
│   ├── layout.tsx      ← Layout ONLY for auth pages
│   ├── login/page.tsx  → URL: /login  (not /auth/login!)
│   └── register/page.tsx
│
├── (dashboard)/        ← Route group — NO effect on URL
│   ├── layout.tsx      ← Layout ONLY for dashboard pages
│   └── dashboard/page.tsx
```

**Why use route groups?**

1. Share a layout among a subset of routes without it appearing in the URL
2. Organize code without polluting URLs
3. Create multiple root layouts for entirely different app sections

---

## Nested Layouts

```
Root Layout        (app/layout.tsx)          — wraps EVERYTHING
  └── Dashboard Layout  (app/(dashboard)/layout.tsx)  — wraps all dashboard pages
        └── Settings Layout  (app/(dashboard)/settings/layout.tsx)  — wraps settings tabs
              └── Profile Page  (settings/profile/page.tsx)
```

**Critical behaviour**: When navigating between settings tabs, only the **Settings Layout** re-renders. The Dashboard Layout and Sidebar do NOT re-render. This is why layouts are more efficient than wrapping every page in a shared component.

---

## Dynamic Routes

```
app/(dashboard)/projects/[projectId]/page.tsx
                           ↑
                      Matched as params.projectId
```

```tsx
// Dynamic segment available as async props
export default async function Page({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params; // Note: params is now a Promise in Next 16
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
```

### Catch-all Routes

```
app/docs/[...slug]/page.tsx   → matches /docs/a, /docs/a/b, /docs/a/b/c
app/docs/[[...slug]]/page.tsx → also matches /docs (optional catch-all)
```

---

## Route Handlers (API Routes)

```typescript
// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";

// Named exports for each HTTP method
export async function GET(request: NextRequest) {
  const data = await db.project.findMany();
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const project = await db.project.create({ data: body });
  return NextResponse.json({ data: project }, { status: 201 });
}
```

**When to use Route Handlers vs direct DB queries in Server Components?**

| Scenario                    | Use Route Handler      | Use Server Component directly |
| --------------------------- | ---------------------- | ----------------------------- |
| Client Component needs data | ✅                     | ❌                            |
| Form mutations              | ✅                     | ❌ (use Server Actions)       |
| Webhooks (Stripe, GitHub)   | ✅                     | ❌                            |
| Initial page data           | ❌ (extra network hop) | ✅                            |
| Third-party API proxying    | ✅                     | ❌                            |

---

## Middleware

```typescript
// src/middleware.ts — runs on the EDGE before every request
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");

  if (!session && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Critical: always configure matcher or middleware runs on EVERYTHING
  // including _next/static, images, favicons — very expensive!
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

---

## Parallel Routes (Advanced)

```
app/
├── layout.tsx
├── @team/page.tsx      ← Parallel slot
└── @analytics/page.tsx ← Parallel slot
```

```tsx
// layout.tsx — receives slots as props
export default function Layout({ children, team, analytics }) {
  return (
    <div>
      {children}
      <Sidebar>{team}</Sidebar>
      <Panel>{analytics}</Panel>
    </div>
  );
}
```

**Use case**: Showing a modal with its own URL without hiding the background page (e.g. Twitter's photo expand pattern).

---

## generateStaticParams (SSG for dynamic routes)

```tsx
// Pre-render /projects/[id] at build time for known IDs
export async function generateStaticParams() {
  const projects = await db.project.findMany({ select: { id: true } });
  return projects.map((p) => ({ projectId: p.id }));
}

export const revalidate = 3600; // Revalidate every hour (ISR)
```

---

## Common Mistakes

1. **Mixing server and client incorrectly**: Importing a Server Component into a Client Component breaks — use it the other way around or pass data as props.

2. **Forgetting `"use client"` on interactive components**: Any component using hooks, event handlers, browser APIs needs `"use client"`.

3. **Creating QueryClient outside a component**: This shares state between users on the server. Always create it inside `useState`.

4. **Not configuring middleware matcher**: Without it, middleware runs on every asset request, decimating performance.

5. **Using `params` without awaiting in Next 16**: `params` is now a Promise — always `await params`.

---

## Interview Notes

**Q: What's the difference between App Router and Pages Router?**

> App Router uses React Server Components by default, supports nested layouts, streaming with Suspense, and route groups. Pages Router is CSR-first, requires `_app.tsx` for global state, and doesn't support nested layouts natively.

**Q: Why are layouts more efficient than wrapping every page?**

> Layouts persist across navigations. When you navigate between routes sharing a layout, React only renders the changed `page.tsx`, not the layout. In Pages Router, everything re-rendered on navigation.

**Q: When would you choose a Route Handler over a Server Action?**

> Route Handlers for GET endpoints, webhooks, and when you need to return custom headers/status codes. Server Actions for form mutations and server-side operations triggered from client components.
