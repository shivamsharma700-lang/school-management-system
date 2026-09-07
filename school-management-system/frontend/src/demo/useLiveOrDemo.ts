import type { UseQueryResult } from "@tanstack/react-query";
import { DEMO_MODE } from "./config";

function isEmptyValue(data: unknown) {
  if (data == null) return true;
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object" && "items" in data) {
    const items = (data as { items?: unknown[] }).items;
    return !Array.isArray(items) || items.length === 0;
  }
  return false;
}

/**
 * Prefer live API data. Demo data is used only when DEMO_MODE is on AND
 * the API is empty or failed. Real records are never overwritten.
 * DEMO DATA ONLY — REMOVE/REPLACE WHEN REAL API IS AVAILABLE
 */
export function useLiveOrDemo<T>(query: UseQueryResult<T>, demo: T) {
  const vacant = isEmptyValue(query.data);
  const useDemo = DEMO_MODE && !query.isFetching && !query.isLoading && (query.isError || vacant);
  return {
    data: useDemo ? demo : query.data,
    isDemo: useDemo,
    isLoading: query.isLoading,
    isError: query.isError && !DEMO_MODE,
    refetch: query.refetch,
  };
}
