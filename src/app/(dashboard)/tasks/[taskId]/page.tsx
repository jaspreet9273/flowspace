// ============================================================
// TASK DETAIL PAGE — Dynamic Route /tasks/[taskId]
//
// LEARNING: This demonstrates a common pattern:
// - Server Component fetches task data
// - Renders static parts (title, description, metadata)
// - Passes data to Client Components for interactive parts
//   (status updates, comments, assignee changes)
// ============================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Flag } from "lucide-react";
import { mockTasks, getTaskWithRelations, mockComments } from "@/lib/mock-data";
import { Header, PageContainer } from "@/components/layout/header";
import { Card, CardContent, Avatar, Badge } from "@/components/ui/index";
import { StatusBadge, PriorityBadge, ProjectDot } from "@/components/tasks/status-badge";
import { TaskDetailClient } from "@/components/tasks/task-detail-client";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ taskId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { taskId } = await params;
  const task = mockTasks.find((t) => t.id === taskId);
  return { title: task?.title ?? "Task Not Found" };
}

export default async function TaskDetailPage({ params }: Props) {
  const { taskId } = await params;
  const task = mockTasks.find((t) => t.id === taskId);
  if (!task) notFound();

  const taskWithRelations = getTaskWithRelations(task);
  const comments = mockComments.filter((c) => c.taskId === taskId);

  return (
    <>
      <Header
        title={taskWithRelations.title}
        actions={
          <Link href="/tasks" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Tasks
          </Link>
        }
      />
      <PageContainer>
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <StatusBadge status={taskWithRelations.status} />
                  <PriorityBadge priority={taskWithRelations.priority} />
                  {taskWithRelations.labels.map((label) => (
                    <Badge key={label} variant="default">{label}</Badge>
                  ))}
                </div>

                <h1 className="text-xl font-semibold text-slate-900 mb-3">
                  {taskWithRelations.title}
                </h1>

                {taskWithRelations.description ? (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {taskWithRelations.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic">No description provided.</p>
                )}
              </CardContent>
            </Card>

            {/* Interactive client section for status updates */}
            <TaskDetailClient task={taskWithRelations} comments={comments} />
          </div>

          {/* Sidebar metadata */}
          <div className="space-y-4">
            <Card>
              <CardContent>
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Project</dt>
                    <dd className="flex items-center gap-2">
                      <ProjectDot color={taskWithRelations.project.color} size="md" />
                      <Link href={`/projects/${taskWithRelations.project.id}`} className="font-medium text-slate-900 hover:text-indigo-600">
                        {taskWithRelations.project.name}
                      </Link>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Assignee</dt>
                    <dd>
                      {taskWithRelations.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar src={taskWithRelations.assignee.avatar} name={taskWithRelations.assignee.name} size="xs" />
                          <span className="text-slate-900">{taskWithRelations.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Created by</dt>
                    <dd className="flex items-center gap-2">
                      <Avatar src={taskWithRelations.creator.avatar} name={taskWithRelations.creator.name} size="xs" />
                      <span className="text-slate-900">{taskWithRelations.creator.name}</span>
                    </dd>
                  </div>

                  {taskWithRelations.dueDate && (
                    <div>
                      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Due date</dt>
                      <dd className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(taskWithRelations.dueDate)}
                      </dd>
                    </div>
                  )}

                  {taskWithRelations.estimate && (
                    <div>
                      <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Estimate</dt>
                      <dd className="flex items-center gap-1.5">
                        <Flag className="h-3.5 w-3.5 text-slate-400" />
                        {taskWithRelations.estimate} points
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Created</dt>
                    <dd className="flex items-center gap-1.5 text-slate-500 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDateTime(taskWithRelations.createdAt)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1.5">Updated</dt>
                    <dd className="text-slate-500 text-xs">{formatDateTime(taskWithRelations.updatedAt)}</dd>
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
