// ============================================================
// ANALYTICS PAGE — Streaming with Suspense
//
// LEARNING: Suspense + async Server Components = Streaming.
// Next.js sends the HTML shell immediately, then streams each
// Suspense boundary as its data resolves.
//
// This means the page is "interactive" before all data loads —
// users see content progressively instead of one big flash.
//
// How it works:
// 1. Shell HTML (header, layout) → sent immediately
// 2. <Suspense fallback={<Skeleton/>}> → placeholder shown
// 3. Async component resolves → streamed and swapped in
//
// PRODUCTION: Combine with generateStaticParams + revalidate
// for analytics that don't need to be real-time.
// ============================================================

import { Suspense } from "react";
import { mockAnalytics } from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import { StatCard, Skeleton, Card } from "@/components/ui/index";
import { ActivityChart, TasksByStatusChart, TasksByPriorityChart } from "@/components/analytics/charts";
import { TrendingUp, CheckSquare, FolderKanban, Users } from "lucide-react";
import { formatPercent } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Analytics" };

// Simulates a slow query — demonstrates streaming
async function getAnalytics() {
  await new Promise((r) => setTimeout(r, 0));
  return mockAnalytics;
}

// Slow component — will stream in after fast content
async function AnalyticsCharts() {
  const data = await getAnalytics();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <ActivityChart data={data} />
      </div>
      <div className="space-y-4">
        <TasksByStatusChart data={data} />
      </div>
      <div className="lg:col-span-3">
        <TasksByPriorityChart data={data} />
      </div>
    </div>
  );
}

async function AnalyticsStats() {
  const data = await getAnalytics();
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Tasks"
        value={data.total_tasks}
        change={{ value: "12%", positive: true }}
        icon={<CheckSquare className="h-5 w-5" />}
        color="bg-blue-50"
      />
      <StatCard
        label="Completed"
        value={data.completed_tasks}
        change={{ value: "8%", positive: true }}
        icon={<TrendingUp className="h-5 w-5" />}
        color="bg-emerald-50"
      />
      <StatCard
        label="Active Projects"
        value={data.active_projects}
        icon={<FolderKanban className="h-5 w-5" />}
        color="bg-purple-50"
      />
      <StatCard
        label="Completion Rate"
        value={formatPercent(data.completion_rate)}
        change={{ value: "3%", positive: true }}
        icon={<Users className="h-5 w-5" />}
        color="bg-amber-50"
      />
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <>
      <Header title="Analytics" description="Workspace performance overview" />
      <PageContainer>
        {/* Stats — streams in first (fast query) */}
        <Suspense fallback={<StatsSkeleton />}>
          <AnalyticsStats />
        </Suspense>

        {/* Charts — streams in second (slower query) */}
        <Suspense fallback={<ChartsSkeleton />}>
          <AnalyticsCharts />
        </Suspense>
      </PageContainer>
    </>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-lg border border-slate-200 bg-white p-5">
          <Skeleton className="h-3 w-24 rounded mb-2" />
          <Skeleton className="h-8 w-16 rounded" />
        </div>
      ))}
    </div>
  );
}

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="p-5">
          <Skeleton className="h-4 w-32 rounded mb-4" />
          <Skeleton className="h-60 w-full rounded" />
        </Card>
      </div>
      <div>
        <Card className="p-5">
          <Skeleton className="h-4 w-24 rounded mb-4" />
          <Skeleton className="h-48 w-full rounded" />
        </Card>
      </div>
    </div>
  );
}
