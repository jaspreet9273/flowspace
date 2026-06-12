// ============================================================
// DASHBOARD PAGE — Server Component
//
// LEARNING: This page fetches data directly on the server.
// No useEffect, no loading spinners for initial data.
// The HTML arrives pre-populated from the server.
//
// RENDERING STRATEGY: SSR (Server-Side Rendering)
// Every request gets fresh data. Good for a dashboard where
// staleness matters.
//
// For static marketing pages use SSG (no async, or generateStaticParams).
// For data that changes rarely, add: revalidate = 3600 (ISR).
// ============================================================

import { Suspense } from "react";
import Link from "next/link";
import { CheckSquare, FolderKanban, Users, TrendingUp, ArrowRight } from "lucide-react";
import { mockAnalytics, mockTasksWithRelations, mockProjects } from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import { StatCard, Card, CardHeader, CardContent, Skeleton } from "@/components/ui/index";
import { TaskRow } from "@/components/tasks/task-card";
import { Progress } from "@/components/ui/forms";
import { formatPercent } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

// Simulate server-side data fetch
async function getDashboardData() {
  // In production: await db.query(...)
  // These would be parallel DB queries:
  // const [analytics, recentTasks, projects] = await Promise.all([...])
  await new Promise((r) => setTimeout(r, 0)); // no delay in demo
  return {
    analytics: mockAnalytics,
    recentTasks: mockTasksWithRelations.slice(0, 6),
    projects: mockProjects.filter((p) => p.status === "active").slice(0, 4),
  };
}

export default async function DashboardPage() {
  const { analytics, recentTasks, projects } = await getDashboardData();

  return (
    <>
      <Header title="Dashboard" description="Welcome back, Alex" />
      <PageContainer>
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Tasks"
            value={analytics.total_tasks}
            change={{ value: "12%", positive: true }}
            icon={<CheckSquare className="h-5 w-5" />}
            color="bg-blue-50"
          />
          <StatCard
            label="Completed"
            value={analytics.completed_tasks}
            change={{ value: "8%", positive: true }}
            icon={<TrendingUp className="h-5 w-5" />}
            color="bg-emerald-50"
          />
          <StatCard
            label="Active Projects"
            value={analytics.active_projects}
            icon={<FolderKanban className="h-5 w-5" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Team Members"
            value={analytics.team_members}
            icon={<Users className="h-5 w-5" />}
            color="bg-amber-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Tasks */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Recent Tasks</h2>
                  <Link
                    href="/tasks"
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                  >
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              {/* Suspense boundary — LEARNING: wrap async sub-components */}
              <Suspense fallback={<TaskListSkeleton />}>
                <div>
                  {recentTasks.map((task) => (
                    <TaskRow key={task.id} task={task} />
                  ))}
                </div>
              </Suspense>
            </Card>
          </div>

          {/* Active Projects */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-slate-900">Active Projects</h2>
                  <Link href="/projects" className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {projects.map((project) => {
                  const progress = project.taskCount > 0
                    ? (project.completedTaskCount / project.taskCount) * 100
                    : 0;
                  return (
                    <Link key={project.id} href={`/projects/${project.id}`} className="block group">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 truncate transition-colors">
                          {project.name}
                        </span>
                      </div>
                      <Progress value={progress} className="mb-1" />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>{project.completedTaskCount}/{project.taskCount} tasks</span>
                        <span>{formatPercent(progress)}</span>
                      </div>
                    </Link>
                  );
                })}
              </CardContent>
            </Card>

            {/* Completion rate */}
            <Card className="mt-4 p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">Overall Completion Rate</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatPercent(analytics.completion_rate)}
              </p>
              <Progress value={analytics.completion_rate} className="mt-3" />
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

function TaskListSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-3 flex-1 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}
