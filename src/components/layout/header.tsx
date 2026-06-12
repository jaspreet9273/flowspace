"use client";

import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui.store";
import { useNotifications } from "@/hooks/queries";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const { setNotificationsPanelOpen, openModal } = useUIStore();
  const { data: notifData } = useNotifications();
  const unreadCount = notifData?.data?.filter((n) => !n.read).length ?? 0;

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-slate-200 bg-white shrink-0">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>

      <div className="flex items-center gap-2">
        {actions}

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setNotificationsPanelOpen(true)}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>

        <Button size="sm" onClick={() => openModal("create-task")}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>
    </header>
  );
}

// ── Page wrapper ─────────────────────────────────────────────

export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("flex-1 overflow-auto bg-slate-50", className)}>
      <div className="p-6">{children}</div>
    </main>
  );
}
