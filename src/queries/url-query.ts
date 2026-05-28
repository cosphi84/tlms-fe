import { Query } from "@/types/query-interface";
import { isValueExists } from "@/helpers/format-helper"

// ─── Core ─────────────────────────────────────────────────────────────────────

/**
 * Filters out undefined, empty, and invalid values from a query object.
 */
export function filterQuery(obj: Query): Query {
    return Object.fromEntries(
        // ✅ fixed: was shadowing param name 'obj' in destructuring
        Object.entries(obj).filter(([key, value]) => isValueExists(key) && isValueExists(value))
    );
}

/**
 * Serializes a query object to a query string WITHOUT leading '?'.
 * Use buildUrl() if you need the full URL.
 */
export function getQueryString(params: Query = {}): string {
    return Object.entries(filterQuery(params))  // ✅ reuse filterQuery, no duplicate logic
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");
}

/**
 * Builds a full URL with query string.
 */
export function buildUrl(url: string, params: Query = {}): string {
    const qs = getQueryString(params);
    return qs ? `${url}?${qs}` : url; // ✅ don't append '?' when no params
}

/**
 * Filters a string-only query object, removing empty/falsy values.
 * Moved from types/query.ts — this is a utility, not a type.
 */
export function cleanQuery(query: Record<string, string>): Record<string, string> {
    // ✅ Object.fromEntries instead of spread-in-reduce (O(n) vs O(n²))
    return Object.fromEntries(
        Object.entries(query).filter(([, value]) => Boolean(value))
    );
}

/** @deprecated use getQueryString instead */
export function queryToString(query: Query): string {
    const qs = getQueryString(query);
    return qs ? `?${qs}` : "";
}