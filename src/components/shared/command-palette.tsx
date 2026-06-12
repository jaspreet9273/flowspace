"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, FolderKanban, ArrowRight } from "lucide-react";
import { useSearch } from "@/hooks/queries";
import { useCommandPalette } from "@/stores/ui.store";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const router = useRouter();
  const { open, setOpen } = useCommandPalette();
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useSearch(query);
  const results = data?.data ?? [];

  // Open with ⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setOpen]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [open]);

  // Arrow key navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[selectedIndex]) {
        // eslint-disable-next-line react-hooks/immutability
        navigate(results[selectedIndex].url);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, results, selectedIndex]);

  const navigate = (url: string) => {
    router.push(url);
    setOpen(false);
    setQuery("");
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl mx-4 rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none"
            placeholder="Search tasks, projects..."
          />
          {isLoading && (
            <div className="h-4 w-4 rounded-full border-2 border-slate-200 border-t-indigo-500 animate-spin" />
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {query.length < 2 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400">
                Type at least 2 characters to search
              </p>
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !isLoading && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-slate-400">
                No results for &ldquo;{query}&rdquo;
              </p>
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={result.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                index === selectedIndex ? "bg-indigo-50" : "hover:bg-slate-50",
              )}
              onClick={() => navigate(result.url)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                  result.type === "task"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-purple-50 text-purple-600",
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
                  <p className="text-xs text-slate-500 truncate">
                    {result.subtitle}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span className="capitalize">{result.type}</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-slate-100 bg-slate-50">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px]">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px]">
              ↵
            </kbd>
            open
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px]">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
