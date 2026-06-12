# Architecture & Folder Structure

> **This document explains every architectural decision in this project.**

---

## Folder Structure

```
flowspace/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Route group — no URL impact
│   │   │   ├── layout.tsx            # Centered card layout for auth
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── (dashboard)/              # Route group — authenticated area
│   │   │   ├── layout.tsx            # Sidebar + global overlays
│   │   │   ├── dashboard/page.tsx    # /dashboard
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # /projects
│   │   │   │   └── [projectId]/page.tsx  # /projects/:id
│   │   │   ├── tasks/
│   │   │   │   ├── page.tsx          # /tasks
│   │   │   │   └── [taskId]/page.tsx # /tasks/:id
│   │   │   ├── kanban/page.tsx       # /kanban
│   │   │   ├── analytics/page.tsx    # /analytics
│   │   │   ├── notifications/page.tsx
│   │   │   ├── members/page.tsx
│   │   │   └── settings/
│   │   │       ├── layout.tsx        # Nested layout — settings tabs
│   │   │       ├── profile/page.tsx
│   │   │       ├── workspace/page.tsx
│   │   │       └── notifications/page.tsx
│   │   │
│   │   ├── api/                      # Route Handlers
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts
│   │   │   │   ├── register/route.ts
│   │   │   │   └── me/route.ts
│   │   │   ├── projects/
│   │   │   │   ├── route.ts          # GET, POST /api/projects
│   │   │   │   └── [id]/route.ts     # GET, PATCH, DELETE /api/projects/:id
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── notifications/route.ts
│   │   │   ├── analytics/route.ts
│   │   │   ├── search/route.ts
│   │   │   └── users/route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout — HTML, fonts, providers
│   │   ├── page.tsx                  # "/" → redirects to /dashboard
│   │   ├── not-found.tsx             # 404 page
│   │   ├── error.tsx                 # Error boundary
│   │   └── loading.tsx               # Root loading state
│   │
│   ├── components/                   # UI components (feature-organized)
│   │   ├── ui/                       # Generic design system components
│   │   │   ├── button.tsx            # Button with variants (CVA)
│   │   │   ├── input.tsx             # Input, Label, Textarea, FormField
│   │   │   ├── index.tsx             # Card, Badge, Avatar, Skeleton, StatCard
│   │   │   └── forms.tsx             # Select, Switch, Tabs, DropdownMenu
│   │   │
│   │   ├── layout/                   # Layout chrome
│   │   │   ├── sidebar.tsx           # Navigation sidebar (Client)
│   │   │   └── header.tsx            # Page header + PageContainer
│   │   │
│   │   ├── tasks/                    # Task feature components
│   │   │   ├── task-card.tsx         # TaskCard (grid) + TaskRow (list)
│   │   │   ├── tasks-client.tsx      # Filter + view toggle (Client)
│   │   │   ├── task-detail-client.tsx# Status update + comments (Client)
│   │   │   ├── create-task-modal.tsx # Modal form (Client)
│   │   │   └── status-badge.tsx      # StatusBadge, PriorityBadge
│   │   │
│   │   ├── projects/
│   │   │   └── projects-client.tsx   # Project grid + create modal
│   │   │
│   │   ├── kanban/
│   │   │   └── kanban-board.tsx      # Drag-and-drop board (Client)
│   │   │
│   │   ├── analytics/
│   │   │   └── charts.tsx            # Recharts components (Client)
│   │   │
│   │   ├── notifications/
│   │   │   └── notifications-panel.tsx # Slide-over panel (Client)
│   │   │
│   │   └── shared/                   # Cross-cutting components
│   │       ├── query-provider.tsx    # TanStack Query setup
│   │       ├── auth-initializer.tsx  # Server→Client auth bridge
│   │       └── command-palette.tsx   # Global search (Client)
│   │
│   ├── hooks/
│   │   └── queries.ts                # All TanStack Query hooks
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── auth.store.ts             # Current user state
│   │   └── ui.store.ts               # Sidebar, modals, panels
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── utils.ts                  # cn(), formatters, constants
│   │   ├── api.ts                    # Typed API client
│   │   ├── mock-data.ts              # Mock database
│   │   └── validations.ts            # Zod schemas
│   │
│   ├── types/
│   │   └── index.ts                  # All TypeScript types
│   │
│   └── middleware.ts                 # Auth route protection
│
├── docs/                             # This learning resource
│   ├── app-router/README.md
│   ├── rendering/README.md
│   ├── data-fetching/README.md
│   ├── caching/README.md
│   ├── performance/README.md
│   ├── architecture/README.md
│   └── interview-prep/README.md
│
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## State Management Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    State Decision Tree                       │
│                                                             │
│  Is it server data? (tasks, projects, users)               │
│  ├── Initial load → Server Component (direct DB/API)       │
│  └── Client updates → TanStack Query                       │
│                                                             │
│  Is it UI state?                                           │
│  ├── Local to one component → useState                     │
│  ├── Shared across unrelated components → Zustand          │
│  └── Derivable from URL → useSearchParams / usePathname    │
│                                                             │
│  Is it auth state?                                         │
│  ├── Server check → cookies() in Server Components         │
│  └── Client access → Zustand auth.store.ts                 │
└─────────────────────────────────────────────────────────────┘
```

### Why Zustand (not Context)?
- No Provider wrapping needed — stores are singletons
- Selectors prevent unnecessary re-renders: `useUIStore(s => s.sidebarCollapsed)`
- Persistence via `persist` middleware (localStorage, sessionStorage)
- DevTools support out of the box
- Tiny (< 1kb)

### Why TanStack Query (not SWR or raw fetch)?
- Optimistic updates with automatic rollback
- Window focus refetching
- Parallel + dependent queries
- Infinite scroll support
- Prefetching
- DevTools with cache inspector
- Background sync

---

## Component Architecture

### Server/Client Boundary Pattern

```
DashboardPage (Server)
│  ↓ fetches data, passes as props
├── StatCards (Server — just renders)
├── TaskList (Server — renders rows)
│   └── TaskRow (Server — static UI)
└── ProjectsClient (Client — interactive)
    │  "use client" boundary starts here
    ├── useState (filter, view)
    ├── useProjects() (TanStack Query)
    └── ProjectCard (Client — needs DropdownMenu)
```

### Why not make everything a Client Component?
1. **Bundle size**: Server Component code never ships to the browser
2. **Performance**: No hydration cost for server-rendered UI
3. **Security**: API keys, DB connections stay server-side
4. **Data fetching**: Direct DB access, no API endpoint needed

---

## Feature-Based Component Organization

Components are organized by **feature** (tasks, projects, kanban), not by **type** (components, containers, pages). This co-locates related code and makes large codebases easier to navigate.

```
✅ Feature-based (this project)
components/tasks/
├── task-card.tsx
├── tasks-client.tsx
├── create-task-modal.tsx
└── status-badge.tsx

❌ Type-based (hard to scale)
components/
├── cards/TaskCard.tsx
├── modals/CreateTaskModal.tsx
└── badges/StatusBadge.tsx
```

---

## TypeScript Strategy

1. **Types in `src/types/index.ts`**: Single source of truth. API, stores, and components all import from here.
2. **Infer types from Zod schemas**: `z.infer<typeof schema>` instead of duplicating types.
3. **No `any`**: Use `unknown` for truly dynamic data, narrow with type guards.
4. **Strict mode enabled**: Catches null/undefined errors at compile time.

---

## Environment Variables Pattern

```bash
# .env.local (never committed)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
STRIPE_SECRET_KEY="..."

# .env.example (committed — shows required vars)
DATABASE_URL=""
NEXTAUTH_SECRET=""
STRIPE_SECRET_KEY=""
```

```typescript
// For server-only variables (no NEXT_PUBLIC_ prefix):
// Only accessible in Server Components, Route Handlers, Middleware
process.env.DATABASE_URL

// For client-accessible variables:
// MUST have NEXT_PUBLIC_ prefix — gets inlined at build time
process.env.NEXT_PUBLIC_API_URL
```

---

## Interview Notes

**Q: How do you decide what goes in Zustand vs TanStack Query?**
> TanStack Query owns server state — data that lives on the server and is fetched asynchronously. Zustand owns client state — UI preferences, modal state, anything that doesn't come from the server. The key test: "Would this data exist if the user had no internet?" If yes, it's client state (Zustand). If no, it's server state (TanStack Query).

**Q: Why not use React Context instead of Zustand?**
> Context re-renders ALL consumers when ANY value changes. Zustand uses selectors so components only re-render when their specific slice changes. For something like a sidebar toggle, Context would re-render every component that reads the context. Zustand only re-renders components that specifically select `sidebarCollapsed`.

**Q: What's the "server/client boundary" and why does it matter?**
> Every `"use client"` file creates a boundary. Everything imported into that file also becomes client code. This means: (1) It adds to the JS bundle. (2) It can't use server-only APIs. The goal is to push boundaries as deep in the tree as possible, keeping most of your component tree as Server Components (zero JS bundle cost).
