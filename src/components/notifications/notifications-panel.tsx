"use client";

import { X, Check, CheckCheck } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Avatar } from "@/components/ui/index";
import { Button } from "@/components/ui/button";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/queries";
import { useUIStore } from "@/stores/ui.store";
import type { Notification } from "@/types";

export function NotificationsPanel() {
  const { notificationsPanelOpen, setNotificationsPanelOpen } = useUIStore();
  const { data, isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      {notificationsPanelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/10"
          onClick={() => setNotificationsPanelOpen(false)}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-96 bg-white border-l border-slate-200 shadow-xl",
          "flex flex-col transition-transform duration-300",
          notificationsPanelOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllRead()}
                className="text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationsPanelOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="space-y-1 p-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-3 animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Check className="h-8 w-8 mb-2" />
              <p className="text-sm">You&apos;re all caught up!</p>
            </div>
          )}

          {!isLoading && notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkRead={() => markRead(n.id)}
            />
          ))}
        </div>
      </aside>
    </>
  );
}

function NotificationItem({
  notification: n,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 px-5 py-3.5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer",
        !n.read && "bg-indigo-50/40"
      )}
      onClick={() => !n.read && onMarkRead()}
    >
      <Avatar src={n.actor.avatar} name={n.actor.name} size="sm" className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900">{n.title}</p>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
        <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
      </div>
      {!n.read && (
        <div className="mt-1.5 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
      )}
    </div>
  );
}
