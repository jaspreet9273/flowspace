"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service (Sentry, etc.)
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] text-center px-4">
      <div className="mb-4 p-4 rounded-full bg-red-50">
        <AlertTriangle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Go to Dashboard
        </Button>
        <Button onClick={reset}>Try again</Button>
      </div>
      {error.digest && (
        <p className="mt-4 text-xs text-slate-400">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
