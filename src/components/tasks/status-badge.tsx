import { cn, TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/lib/utils";
import type { TaskStatus, TaskPriority } from "@/types";
import {
  Circle,
  Dot,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  SignalLow,
  SignalMedium,
  Signal,
  AlertTriangle,
  Minus,
} from "lucide-react";

// ── Status Badge ──────────────────────────────────────────────

const StatusIcons: Record<TaskStatus, React.ComponentType<{ className?: string }>> = {
  backlog: Dot,
  todo: Circle,
  in_progress: Loader2,
  in_review: Eye,
  done: CheckCircle2,
  cancelled: XCircle,
};

interface StatusBadgeProps {
  status: TaskStatus;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function StatusBadge({ status, showLabel = true, size = "sm" }: StatusBadgeProps) {
  const config = TASK_STATUS_CONFIG[status];
  const Icon = StatusIcons[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        config.bgColor,
        config.color
      )}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {showLabel && config.label}
    </span>
  );
}

// ── Priority Badge ────────────────────────────────────────────

const PriorityIcons: Record<TaskPriority, React.ComponentType<{ className?: string }>> = {
  urgent: AlertTriangle,
  high: Signal,
  medium: SignalMedium,
  low: SignalLow,
  no_priority: Minus,
};

interface PriorityBadgeProps {
  priority: TaskPriority;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function PriorityBadge({ priority, showLabel = true, size = "sm" }: PriorityBadgeProps) {
  const config = TASK_PRIORITY_CONFIG[priority];
  const Icon = PriorityIcons[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium",
        size === "sm" ? "text-xs" : "text-sm",
        config.color
      )}
    >
      <Icon className={cn("shrink-0", size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
      {showLabel && config.label}
    </span>
  );
}

// ── Project Color Dot ─────────────────────────────────────────

export function ProjectDot({ color, size = "sm" }: { color: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn("rounded-full shrink-0", size === "sm" ? "h-2 w-2" : "h-3 w-3")}
      style={{ backgroundColor: color }}
    />
  );
}
