"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PageMeta } from "@/types";
import { getCurrentUser, getFilterOptions } from "./api";

/**
 * Keeps a page's filters in the URL (e.g. /patients?condition=critical&page=2), so a refresh
 * or the Back button keeps the view. `defaults` lists every filter and its default value.
 */
export function useUrlFilters<T extends Record<string, string>>(defaults: T) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const value = searchParams.get(key as string);
    if (value !== null) filters[key] = value as T[keyof T];
  }

  function updateFilters(changes: Partial<T>) {
    // Read the address bar at the moment of the change, not from this render. A delayed call
    // (like the debounced search box) could otherwise write back an old URL and undo a filter
    // the user picked in the meantime.
    const params = new URLSearchParams(window.location.search);

    for (const [key, value] of Object.entries(changes)) {
      // Leave defaults out of the URL to keep it short.
      if (!value || value === defaults[key]) params.delete(key);
      else params.set(key, value);
    }

    // Any filter change starts again from the first page.
    if (!("page" in changes)) params.delete("page");

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearFilters() {
    router.replace(pathname, { scroll: false });
  }

  return { filters, updateFilters, clearFilters };
}

/** True when the server says we asked for a page that doesn't exist (e.g. ?page=9 of 3). */
export function isPageOutOfRange(meta: PageMeta | undefined) {
  return meta !== undefined && meta.page > meta.totalPages;
}

/**
 * If the current page no longer exists (you deleted the last row on the last page,
 * or opened ?page=99), jump to the last page that does.
 */
export function useKeepPageInRange(meta: PageMeta | undefined) {
  const router = useRouter();
  const pathname = usePathname();
  const page = meta?.page;
  const totalPages = meta?.totalPages;

  useEffect(() => {
    if (page === undefined || totalPages === undefined || page <= totalPages) return;
    const params = new URLSearchParams(window.location.search);
    if (totalPages <= 1) params.delete("page");
    else params.set("page", String(totalPages));
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [page, totalPages, router, pathname]);
}

/** Counts how many of the listed filter keys are set. */
export function countActiveFilters(filters: Record<string, string>, keys: string[]) {
  let count = 0;
  for (const key of keys) {
    if (filters[key]) count += 1;
  }
  return count;
}

function subscribeToNothing() {
  return () => {};
}

/**
 * False on the server and while React is hydrating, true afterwards.
 * Lets us show browser-only data without a "server HTML doesn't match" error.
 */
export function useIsClient() {
  return useSyncExternalStore(subscribeToNothing, () => true, () => false);
}

export function useCurrentUser() {
  const isClient = useIsClient();
  const query = useQuery({
    queryKey: ["me"],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });

  // The server never knows the user, so hydration must render "no user" too.
  const user = isClient ? query.data : undefined;
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  // Before hydration we treat the user as "still loading" on both server and client.
  const isLoading = !isClient || (!user && query.isLoading);
  return { user, isAdmin, isStaff, isLoading };
}

/**
 * After a create, edit or delete, mark the affected cached data as stale so it refetches.
 * Doctors, patients, stats and dropdown options all depend on each other, so we refresh all four.
 */
export function useRefreshData() {
  const queryClient = useQueryClient();
  return function refreshData() {
    queryClient.invalidateQueries({ queryKey: ["doctors"] });
    queryClient.invalidateQueries({ queryKey: ["doctor"] });
    queryClient.invalidateQueries({ queryKey: ["patients"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["options"] });
  };
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["options"],
    queryFn: getFilterOptions,
    staleTime: 60 * 1000,
  });
}
