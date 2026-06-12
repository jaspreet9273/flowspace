"use client";

import { Bell, CheckCheck } from "lucide-react";
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@/hooks/queries";
import { Header, PageContainer } from "@/components/layout/header";
import { Card } from "@/components/ui/index";
import { Avatar, Skeleton, EmptyState } from "@/components/ui/index";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/forms";
import { formatRelativeTime, cn } from "@/lib/utils";
import { useState } from "react";
import type { Notification } from "@/types";

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const { data, isLoading } = useNotifications();
  const { mutate: markAllRead } = useMarkAllNotificationsRead();
  const { mutate: markRead } = useMarkNotificationRead();

  const notifications = data?.data ?? [];
  const unread = notifications.filter((n) => !n.read);
  const filtered = tab === "unread" ? unread : notifications;

  return (
    <>
      <Header
        title="Notifications"
        actions={
          unread.length > 0 ? (
            <Button variant="outline" size="sm" onClick={() => markAllRead()}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          ) : undefined
        }
      />
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Tabs
            tabs={[
              { id: "all", label: "All", count: notifications.length },
              { id: "unread", label: "Unread", count: unread.length },
            ]}
            active={tab}
            onChange={setTab}
            className="mb-4"
          />

          <Card>
            {isLoading && (
              <div className="divide-y divide-slate-100">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3 p-4">
                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-3/4 rounded" />
                      <Skeleton className="h-3 w-full rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filtered.length === 0 && (
              <EmptyState
                icon={<Bell className="h-10 w-10" />}
                title="All caught up!"
                description="No notifications to show."
              />
            )}

            {!isLoading && (
              <div className="divide-y divide-slate-100">
                {filtered.map((n) => (
                  <NotificationRow key={n.id} notification={n} onMarkRead={() => markRead(n.id)} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </PageContainer>
    </>
  );
}

function NotificationRow({ notification: n, onMarkRead }: { notification: Notification; onMarkRead: () => void }) {
  return (
    <div
      className={cn(
        "flex gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors",
        !n.read && "bg-indigo-50/30"
      )}
      onClick={() => !n.read && onMarkRead()}
    >
      <Avatar src={n.actor.avatar} name={n.actor.name} size="sm" className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-slate-900">{n.title}</p>
            <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
            <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(n.createdAt)}</p>
          </div>
          {!n.read && <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />}
        </div>
      </div>
    </div>
  );
}
