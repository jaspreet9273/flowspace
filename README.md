# Flowspace — Production SaaS Dashboard + Next.js Learning Resource

A production-grade SaaS project management dashboard built with Next.js 16 App Router. This repository serves two purposes: a real SaaS product and a comprehensive Next.js learning resource.

## Tech Stack

| Layer        | Technology               |
| ------------ | ------------------------ |
| Framework    | Next.js 16 (App Router)  |
| Language     | TypeScript (strict mode) |
| Styling      | Tailwind CSS             |
| Server State | TanStack Query v5        |
| Client State | Zustand v5               |
| Forms        | React Hook Form + Zod    |
| Charts       | Recharts                 |
| Icons        | Lucide React             |

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 and sign in with:

- Email: alex@acme.com
- Password: password123 (any 8+ char password in demo)

## Features

- Authentication — Login, Register, Forgot Password
- Dashboard — Stats, recent tasks, project progress
- Projects — CRUD with color picker and member tracking
- Tasks — List/Grid views with multi-filter
- Kanban Board — Drag and drop with optimistic updates
- Analytics — Streaming charts with Suspense
- Notifications — Real-time panel, mark read
- Search — Global command palette (Cmd+K)
- Settings — Nested layout tabs (profile, workspace, notifications)
- Members — Team roster with roles

## Documentation

See /docs for complete guides on every Next.js concept implemented:

- docs/app-router/README.md
- docs/rendering/README.md
- docs/data-fetching/README.md
- docs/caching/README.md
- docs/performance/README.md
- docs/architecture/README.md
- docs/interview-prep/README.md
