"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Kanban,
  BarChart3,
  Bell,
  Settings,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/index";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useNotifications } from "@/hooks/queries";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/kanban", label: "Kanban", icon: Kanban },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/members", label: "Members", icon: Users },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings/profile", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: notifData } = useNotifications();

  const unreadCount = notifData?.data?.filter((n) => !n.read).length ?? 0;

  const navItemsWithBadge: NavItem[] = NAV_ITEMS.map((item) => ({
    ...item,
    badge: item.href === "/notifications" && unreadCount > 0 ? unreadCount : undefined,
  }));

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-slate-900 text-white transition-all duration-300 shrink-0",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-slate-700/50">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-sm">Flowspace</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors",
            sidebarCollapsed && "mx-auto"
          )}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Search shortcut */}
      <div className="px-3 py-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            "flex items-center gap-2 w-full rounded-md px-2.5 py-1.5 text-xs text-slate-400",
            "bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700/50",
            sidebarCollapsed && "justify-center px-2"
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="px-1 rounded bg-slate-700 text-slate-500 text-[10px]">⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItemsWithBadge.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50",
                sidebarCollapsed && "justify-center px-2"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <div className="relative shrink-0">
                <Icon className="h-4 w-4" />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-700/50 p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-md p-2 hover:bg-slate-700/50 cursor-pointer transition-colors",
            sidebarCollapsed && "justify-center"
          )}
        >
          {user && (
            <Avatar src={user.avatar} name={user.name} size="sm" className="shrink-0" />
          )}
          {!sidebarCollapsed && user && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="text-slate-500 hover:text-white transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
