const PREFIX = "streamflix:";
const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry<T> {
  t: number;
  v: T;
}

/**
 * Small session-scoped cache for API responses. It prevents repeat Render
 * requests when a user navigates back to the same title, switches seasons, or
 * re-runs the same search within a tab.
 */
export function readCache<T>(key: string, maxAgeMs = DEFAULT_TTL_MS): T | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (!entry || typeof entry.t !== "number" || !("v" in entry)) {
      window.sessionStorage.removeItem(PREFIX + key);
      return null;
    }

    if (Date.now() - entry.t > maxAgeMs) {
      window.sessionStorage.removeItem(PREFIX + key);
      return null;
    }

    return entry.v;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  try {
    const entry: CacheEntry<T> = { t: Date.now(), v: value };
    window.sessionStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota or privacy mode: caching is optional, so ignore failures.
  }
}
