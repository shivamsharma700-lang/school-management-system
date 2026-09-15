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
 * Prefer live API data.
 * Demo fixtures are used ONLY when VITE_DEMO_MODE=true AND the request finished
 * with an error or empty payload. Production never substitutes fake records.
 */
export function useLiveOrDemo<T>(query: UseQueryResult<T>, demo: T) {
  const vacant = isEmptyValue(query.data);
  const settled = !query.isFetching && !query.isLoading;
  const useDemo = DEMO_MODE && settled && (query.isError || vacant);
  return {
    data: useDemo ? demo : query.data,
    isDemo: useDemo,
    isLoading: query.isLoading,
    isError: query.isError && !useDemo,
    refetch: query.refetch,
  };
}
