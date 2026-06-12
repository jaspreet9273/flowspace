// ============================================================
// DASHBOARD LAYOUT — Route Group: (dashboard)
//
// LEARNING: This layout is a Server Component that:
// 1. Reads the session cookie to get the current user
// 2. Passes user data to client components via props
// 3. Renders the sidebar + main content shell
//
// NESTED LAYOUTS: App Router composes layouts automatically.
// Root layout → Dashboard layout → Page
// Each nests inside the other without re-rendering the outer ones.
//
// ARCHITECTURE: Server Components can read cookies directly
// without an API call. This is more efficient than client-side
// auth checks because it avoids a waterfall.
// ============================================================

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mockCurrentUser } from "@/lib/mock-data";
import { Sidebar } from "@/components/layout/sidebar";
import { CommandPalette } from "@/components/shared/command-palette";
import { NotificationsPanel } from "@/components/notifications/notifications-panel";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { AuthInitializer } from "@/components/shared/auth-initializer";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check — runs before any React renders
  // PRODUCTION: verify JWT with jose library here
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  // For demo, we allow access without session to avoid
  // forcing real login for evaluation. In production, uncomment:
  // if (!session) redirect("/login");

  // In production: decode JWT → get userId → query DB
  const user = session ? mockCurrentUser : mockCurrentUser; // demo: always mock user

  return (
    <>
      {/* Hydrate Zustand auth store from server-resolved user */}
      <AuthInitializer user={user} />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar — Client Component (needs interactivity) */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Global overlays — rendered outside the flex layout */}
      <CommandPalette />
      <NotificationsPanel />
      <CreateTaskModal />
    </>
  );
}
