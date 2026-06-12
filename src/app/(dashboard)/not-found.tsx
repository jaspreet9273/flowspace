import Link from "next/link";
import { FolderX } from "lucide-react";

// This not-found.tsx sits inside (dashboard) so it gets the sidebar layout
export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] text-center px-4">
      <div className="mb-4 p-4 rounded-full bg-slate-100">
        <FolderX className="h-8 w-8 text-slate-400" />
      </div>
      <h1 className="text-xl font-semibold text-slate-900 mb-2">Page not found</h1>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access.
      </p>
      <Link
        href="/dashboard"
        className="text-sm font-medium text-indigo-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
