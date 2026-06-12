// ============================================================
// SETTINGS LAYOUT — Nested Layout
//
// LEARNING: Nested layouts in App Router compose automatically.
// Root → Dashboard → Settings → Page
//
// Each layout only re-renders when its segment changes.
// The sidebar and dashboard layout DON'T re-render when
// navigating between settings tabs — only this layout does.
// ============================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Header, PageContainer } from "@/components/layout/header";

const SETTINGS_NAV = [
  { href: "/settings/profile", label: "Profile" },
  { href: "/settings/workspace", label: "Workspace" },
  { href: "/settings/notifications", label: "Notifications" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <Header title="Settings" />
      <PageContainer>
        <div className="max-w-3xl mx-auto">
          {/* Settings nav tabs */}
          <div className="flex gap-1 border-b border-slate-200 mb-6">
            {SETTINGS_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                  pathname === item.href
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </PageContainer>
    </>
  );
}
