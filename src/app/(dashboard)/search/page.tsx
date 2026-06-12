"use client";

// ============================================================
// SEARCH PAGE
//
// LEARNING: URL as state — the search query lives in the URL
// so results are shareable and bookmarkable. useSearchParams()
// reads it, router.push() updates it.
// ============================================================

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, FileText, FolderKanban } from "lucide-react";
import { useSearch } from "@/hooks/queries";
import { Input } from "@/components/ui/input";
import { Header, PageContainer } from "@/components/layout/header";
import { Card, Skeleton, EmptyState } from "@/components/ui/index";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  const { data, isLoading } = useSearch(query);
  const results = data?.data ?? [];

  // Sync input → URL (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      router.replace(`/search${query ? `?${params}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, router]);

  return (
    <>
      <Header title="Search" />
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Input
            startIcon={<Search className="h-4 w-4" />}
            placeholder="Search tasks and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 text-base mb-6"
            autoFocus
          />

          {/* Loading */}
          {isLoading && query.length >= 2 && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 p-4 rounded-lg border border-slate-200 bg-white">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No query */}
          {!query && (
            <EmptyState
              icon={<Search className="h-10 w-10" />}
              title="Start searching"
              description="Search across all tasks and projects in your workspace."
            />
          )}

          {/* Query too short */}
          {query.length === 1 && (
            <p className="text-sm text-slate-400 text-center py-8">
              Type at least 2 characters to search
            </p>
          )}

          {/* No results */}
          {!isLoading && query.length >= 2 && results.length === 0 && (
            <EmptyState
              title={`No results for "${query}"`}
              description="Try different keywords or check your spelling."
            />
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
                {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
              <Card>
                <div className="divide-y divide-slate-100">
                  {results.map((result) => (
                    <Link
                      key={result.id}
                      href={result.url}
                      className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          result.type === "task"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-purple-50 text-purple-600"
                        )}
                      >
                        {result.type === "task" ? (
                          <FileText className="h-4 w-4" />
                        ) : (
                          <FolderKanban className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {result.title}
                        </p>
                        {result.subtitle && (
                          <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 capitalize shrink-0">
                        {result.type}
                      </span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </PageContainer>
    </>
  );
}
