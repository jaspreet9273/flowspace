// ============================================================
// PROJECTS PAGE — Server Component
//
// LEARNING: Data is fetched on the server, no client-side
// loading state for initial render. Subsequent mutations
// (create/delete) use TanStack Query to update the UI
// optimistically via the ProjectsClient component.
// ============================================================

import { Suspense } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { mockProjects, mockUsers } from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import { ProjectsClient } from "@/components/projects/projects-client";
import { Skeleton } from "@/components/ui/index";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Projects" };

async function getProjects() {
  await new Promise((r) => setTimeout(r, 0));
  return mockProjects;
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <Header
        title="Projects"
        description={`${projects.filter((p) => p.status === "active").length} active projects`}
      />
      <PageContainer>
        <Suspense fallback={<ProjectsGridSkeleton />}>
          <ProjectsClient initialProjects={projects} users={mockUsers} />
        </Suspense>
      </PageContainer>
    </>
  );
}

function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-32 rounded" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
          <Skeleton className="h-1.5 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
