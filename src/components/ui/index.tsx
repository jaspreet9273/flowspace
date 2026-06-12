"use client";

import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

// ── Badge ────────────────────────────────────────────────────

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-sm",
        variant === "default" && "bg-slate-100 text-slate-700",
        variant === "outline" && "border border-slate-200 text-slate-600",
        variant === "success" && "bg-emerald-50 text-emerald-700",
        variant === "warning" && "bg-amber-50 text-amber-700",
        variant === "danger" && "bg-red-50 text-red-700",
        variant === "info" && "bg-blue-50 text-blue-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// ── Avatar ───────────────────────────────────────────────────

interface AvatarProps {
  src?: string;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-xs",
  sm: "h-8 w-8 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ src, name, size = "sm", className }: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 rounded-full overflow-hidden bg-indigo-100",
        sizeMap[size],
        className
      )}
    >
      {src && !imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium text-indigo-700">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}

// ── AvatarGroup ──────────────────────────────────────────────

interface AvatarGroupProps {
  users: Array<{ id: string; name: string; avatar?: string }>;
  max?: number;
  size?: AvatarProps["size"];
}

export function AvatarGroup({ users, max = 3, size = "sm" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((user) => (
        <div key={user.id} className="ring-2 ring-white rounded-full">
          <Avatar src={user.avatar} name={user.name} size={size} />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "ring-2 ring-white rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600",
            sizeMap[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ── Card ─────────────────────────────────────────────────────

export function Card({
  children,
  className,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-sm",
        onClick && "cursor-pointer hover:border-slate-300 transition-colors",
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 border-b border-slate-100", className)}>{children}</div>;
}

export function CardContent({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4", className)}>{children}</div>;
}

export function CardFooter({ children, className }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4 border-t border-slate-100 bg-slate-50 rounded-b-lg", className)}>
      {children}
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-100", className)} />;
}

// ── Stat Card ────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon?: React.ReactNode;
  color?: string;
}

export function StatCard({ label, value, change, icon, color = "bg-indigo-50" }: StatCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
          {change && (
            <p className={cn("mt-1 text-xs font-medium", change.positive ? "text-emerald-600" : "text-red-500")}>
              {change.positive ? "↑" : "↓"} {change.value} from last month
            </p>
          )}
        </div>
        {icon && (
          <div className={cn("p-2.5 rounded-lg", color)}>
            <div className="text-indigo-600">{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

// ── Re-exports from forms.tsx for convenience ────────────────
export { EmptyState, Progress } from "./forms";
