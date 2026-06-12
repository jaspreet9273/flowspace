"use client";

// ============================================================
// QUERY PROVIDER
//
// LEARNING: TanStack Query needs a QueryClient. In App Router,
// this must be a Client Component because QueryClient uses
// browser APIs (window, etc.) that don't exist on the server.
//
// We create the client with useState so each browser tab gets
// its own instance — don't create it outside the component or
// it will be shared across users on the server!
//
// PATTERN: Wrap your root layout's client subtree here.
// Server Components above this are not affected.
// ============================================================

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 60 seconds before a background refetch
        staleTime: 60 * 1000,
        // Keep data in cache for 5 minutes after last use
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 1 time (don't hammer the server)
        retry: 1,
        // Refetch when window regains focus (great for SaaS apps)
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always make a new client to avoid sharing between requests
    return makeQueryClient();
  }
  // Browser: reuse the same client across re-renders
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
