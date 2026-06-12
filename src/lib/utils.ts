import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type TaskPriority, type TaskStatus } from "@/types";

// ── Class name utility ──────────────────────────────────────
// Merges Tailwind classes correctly, resolving conflicts.
// Usage: cn("px-4 py-2", condition && "bg-blue-500", className)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Date formatters ─────────────────────────────────────────

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

// ── Status helpers ──────────────────────────────────────────

export const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string }
> = {
  backlog: { label: "Backlog", color: "text-slate-500", bgColor: "bg-slate-100" },
  todo: { label: "Todo", color: "text-blue-600", bgColor: "bg-blue-50" },
  in_progress: { label: "In Progress", color: "text-amber-600", bgColor: "bg-amber-50" },
  in_review: { label: "In Review", color: "text-purple-600", bgColor: "bg-purple-50" },
  done: { label: "Done", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  cancelled: { label: "Cancelled", color: "text-slate-400", bgColor: "bg-slate-50" },
};

export const TASK_PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; icon: string }
> = {
  urgent: { label: "Urgent", color: "text-red-600", icon: "🔴" },
  high: { label: "High", color: "text-orange-500", icon: "🟠" },
  medium: { label: "Medium", color: "text-amber-500", icon: "🟡" },
  low: { label: "Low", color: "text-blue-500", icon: "🔵" },
  no_priority: { label: "No Priority", color: "text-slate-400", icon: "⚪" },
};

// ── String helpers ──────────────────────────────────────────

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ── Number helpers ──────────────────────────────────────────

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

// ── Array helpers ───────────────────────────────────────────

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (acc, item) => {
      const group = String(item[key]);
      return { ...acc, [group]: [...(acc[group] || []), item] };
    },
    {} as Record<string, T[]>
  );
}

// ── Color helpers ───────────────────────────────────────────

export const PROJECT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
];

export function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}
