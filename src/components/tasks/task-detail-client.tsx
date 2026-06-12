"use client";

import { useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { useUpdateTask } from "@/hooks/queries";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/forms";
import { Card, CardHeader, CardContent, Avatar } from "@/components/ui/index";
import { StatusBadge } from "./status-badge";
import { formatRelativeTime } from "@/lib/utils";
import type { TaskWithRelations, Comment, TaskStatus } from "@/types";

const STATUS_OPTIONS: { label: string; value: TaskStatus }[] = [
  { label: "Backlog", value: "backlog" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "In Review", value: "in_review" },
  { label: "Done", value: "done" },
  { label: "Cancelled", value: "cancelled" },
];

interface TaskDetailClientProps {
  task: TaskWithRelations;
  comments: Comment[];
}

export function TaskDetailClient({ task, comments: initialComments }: TaskDetailClientProps) {
  const { mutate: updateTask, isPending } = useUpdateTask();
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task.status);

  const handleStatusChange = (status: string) => {
    setCurrentStatus(status as TaskStatus);
    updateTask({ id: task.id, data: { status: status as TaskStatus } });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    // Demo: add comment locally (in production, call API)
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      content: commentText.trim(),
      taskId: task.id,
      authorId: "user_1",
      author: { id: "user_1", name: "Alex Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText("");
  };

  return (
    <div className="space-y-4">
      {/* Status updater */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Update Status</p>
              <StatusBadge status={currentStatus} />
            </div>
            <Select
              options={STATUS_OPTIONS}
              value={currentStatus}
              onChange={handleStatusChange}
              className="w-44"
              disabled={isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-slate-400" />
            Comments ({comments.length})
          </h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No comments yet. Be the first!</p>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar src={comment.author.avatar} name={comment.author.name} size="sm" className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-900">{comment.author.name}</span>
                  <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{comment.content}</p>
              </div>
            </div>
          ))}

          {/* Add comment */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" name="Alex Johnson" size="sm" className="shrink-0 mt-1" />
            <div className="flex-1 space-y-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAddComment();
                }}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">⌘+Enter to submit</p>
                <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}>
                  <Send className="h-3.5 w-3.5 mr-1" />
                  Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
