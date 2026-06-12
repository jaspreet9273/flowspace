// ============================================================
// DYNAMIC ROUTE: /projects/[projectId]
//
// LEARNING: Dynamic routes use [paramName] in the folder name.
// The param is available in the page props as params.projectId.
//
// generateStaticParams() — used for SSG/ISR:
// Export this function to pre-render dynamic routes at build time.
// Without it, the page renders on each request (SSR).
//
// PRODUCTION PATTERN: For public project pages, use ISR.
// For private dashboard data, use SSR (no generateStaticParams).
// ============================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckSquare, Users } from "lucide-react";
import {
  mockProjects,
  mockTasksWithRelations,
  mockUsers,
} from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import {
  Card,
  CardHeader,
  CardContent,
  AvatarGroup,
  Progress,
  StatCard,
} from "@/components/ui/index";
import { TaskRow } from "@/components/tasks/task-card";
import { formatDate, formatPercent } from "@/lib/utils";
import type { Metadata } from "next";
import Image from "next/image";

interface Props {
  params: Promise<{ projectId: string }>;
}

// generateMetadata — dynamic metadata based on route params
// LEARNING: This runs on the server, can do DB queries
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params;
  const project = mockProjects.find((p) => p.id === projectId);
  return { title: project?.name ?? "Project Not Found" };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { projectId } = await params;
  const project = mockProjects.find((p) => p.id === projectId);

  // notFound() triggers the nearest not-found.tsx boundary
  if (!project) notFound();

  const tasks = mockTasksWithRelations.filter((t) => t.projectId === projectId);
  const members = mockUsers.filter((u) => project.memberIds.includes(u.id));
  const completionRate =
    project.taskCount > 0
      ? (project.completedTaskCount / project.taskCount) * 100
      : 0;

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo" || t.status === "backlog")
      .length,
    inProgress: tasks.filter(
      (t) => t.status === "in_progress" || t.status === "in_review",
    ).length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <>
      <Header
        title={project.name}
        description={project.description}
        actions={
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Projects
          </Link>
        }
      />
      <PageContainer>
        {/* Project header card */}
        <Card className="mb-6 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg shrink-0"
                style={{ backgroundColor: project.color }}
              />
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {project.name}
                </h2>
                {project.dueDate && (
                  <p className="text-sm text-slate-500">
                    Due {formatDate(project.dueDate)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AvatarGroup users={members} max={5} size="sm" />
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                style={{
                  backgroundColor: `${project.color}20`,
                  color: project.color,
                }}
              >
                {project.status}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-500 mb-1.5">
              <span>Progress</span>
              <span className="font-medium text-slate-700">
                {formatPercent(completionRate)}
              </span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Tasks"
            value={project.taskCount}
            icon={<CheckSquare className="h-5 w-5" />}
          />
          <StatCard
            label="To Do"
            value={tasksByStatus.todo}
            color="bg-blue-50"
            icon={<CheckSquare className="h-5 w-5" />}
          />
          <StatCard
            label="In Progress"
            value={tasksByStatus.inProgress}
            color="bg-amber-50"
            icon={<CheckSquare className="h-5 w-5" />}
          />
          <StatCard
            label="Done"
            value={tasksByStatus.done}
            color="bg-emerald-50"
            icon={<CheckSquare className="h-5 w-5" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks list */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-slate-900">Tasks</h3>
              </CardHeader>
              <div>
                {tasks.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-slate-400 text-center">
                    No tasks yet
                  </p>
                ) : (
                  tasks.map((task) => <TaskRow key={task.id} task={task} />)
                )}
              </div>
            </Card>
          </div>

          {/* Members + Meta */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-slate-900">
                  <Users className="h-4 w-4 inline mr-1.5 text-slate-400" />
                  Members ({members.length})
                </h3>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-2.5">
                    {member.avatar && (
                      <Image
                        src={member.avatar}
                        alt={member.name}
                        width={28}
                        height={28}
                        className="rounded-full"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-400 capitalize">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="capitalize font-medium text-slate-900">
                      {project.status}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Created</dt>
                    <dd className="text-slate-700">
                      {formatDate(project.createdAt)}
                    </dd>
                  </div>
                  {project.dueDate && (
                    <div className="flex justify-between">
                      <dt className="text-slate-500">Due date</dt>
                      <dd className="text-slate-700">
                        {formatDate(project.dueDate)}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Completion</dt>
                    <dd className="font-medium text-slate-900">
                      {formatPercent(completionRate)}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    </>
  );
}
