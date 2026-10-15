/** How long a persisted read-model snapshot may be shown after a reload. */
export const SUITE_QUERY_CACHE_MAX_AGE_MS = 30 * 60 * 1000;

const MAX_SNAPSHOT_CHARS = 1_500_000;

export type QueryKeyPart = string | readonly string[];

export interface PersistableQuery {
  queryKey: readonly unknown[];
  state: { status: string; data: unknown };
}

export interface PersistableQueryClient {
  getQueryCache(): {
    getAll(): PersistableQuery[];
    subscribe(listener: () => void): () => void;
  };
  setQueryData(queryKey: readonly unknown[], data: unknown): unknown;
  invalidateQueries(filters: {
    queryKey: readonly unknown[];
    refetchType: 'none';
  }): Promise<unknown>;
}

export interface PersistSuiteQueriesOptions {
  /** localStorage key, including a version. */
  storageKey: string;
  /** Access-token localStorage key. The JWT `sub` is the user half of the buster. */
  tokenKey: string;
  /** Active workspace localStorage key. */
  workspaceKey: string;
  /**
   * Query keys to keep. A string matches `queryKey[0]`. A list matches a prefix,
   * so `['tt', 'tracker-catalog']` does not keep `['tt', 'time-entries']`.
   */
  allow: readonly QueryKeyPart[];
  maxAgeMs?: number;
}

interface StoredQueryCache {
  buster: string;
  savedAt: number;
  queries: Array<{ queryKey: readonly unknown[]; data: unknown }>;
}

/**
 * User and workspace identity for a snapshot. Empty when the tab is signed out,
 * which refuses both restore and write.
 */
export function suiteCacheBuster(tokenKey: string, workspaceKey: string): string {
  if (typeof window === 'undefined') return '';
  let token: string | null = null;
  let workspace: string | null = null;
  try {
    token = window.localStorage.getItem(tokenKey);
    workspace =
      window.localStorage.getItem(workspaceKey) ||
      readCookie('xenide_active_workspace_id');
  } catch {
    return '';
  }
  const subject = subjectFromAccessToken(token);
  if (!subject || !workspace) return '';
  return `${subject}:${workspace}`;
}

export function readJsonSnapshot<T>(key: string, buster: string, maxAgeMs: number): T | null {
  if (typeof window === 'undefined' || !buster) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { buster?: string; savedAt?: number; value?: T };
    if (parsed.buster !== buster || typeof parsed.savedAt !== 'number') return null;
    if (Date.now() - parsed.savedAt > maxAgeMs) return null;
    return parsed.value ?? null;
  } catch {
    return null;
  }
}

export function writeJsonSnapshot(key: string, buster: string, value: unknown): void {
  if (typeof window === 'undefined' || !buster) return;
  try {
    const raw = JSON.stringify({ buster, savedAt: Date.now(), value });
    if (raw.length > MAX_SNAPSHOT_CHARS) return;
    window.localStorage.setItem(key, raw);
  } catch {
    // Private mode and quota failures leave the screen on the network.
  }
}

/**
 * Restore an allow-listed query cache, then keep writing it. Restored queries
 * are marked stale so the next mount refetches without hiding the snapshot.
 * Returns an unsubscribe.
 */
export function persistSuiteQueries(
  queryClient: PersistableQueryClient,
  options: PersistSuiteQueriesOptions,
): () => void {
  const maxAgeMs = options.maxAgeMs ?? SUITE_QUERY_CACHE_MAX_AGE_MS;
  restore(queryClient, options, maxAgeMs);

  let timer = 0;
  const unsubscribe = queryClient.getQueryCache().subscribe(() => {
    if (typeof window === 'undefined') return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => save(queryClient, options), 400);
  });
  return () => {
    if (typeof window !== 'undefined') window.clearTimeout(timer);
    unsubscribe();
  };
}

function restore(
  queryClient: PersistableQueryClient,
  options: PersistSuiteQueriesOptions,
  maxAgeMs: number,
): void {
  const buster = suiteCacheBuster(options.tokenKey, options.workspaceKey);
  const stored = readJsonSnapshot<StoredQueryCache['queries']>(
    options.storageKey,
    buster,
    maxAgeMs,
  );
  // readJsonSnapshot returns the `value`, which we store as the queries array.
  if (!Array.isArray(stored)) return;
  for (const entry of stored) {
    if (!entry || !Array.isArray(entry.queryKey) || !allowed(entry.queryKey, options.allow)) {
      continue;
    }
    queryClient.setQueryData(entry.queryKey, entry.data);
    void queryClient.invalidateQueries({
      queryKey: entry.queryKey,
      refetchType: 'none',
    });
  }
}

function save(queryClient: PersistableQueryClient, options: PersistSuiteQueriesOptions): void {
  const buster = suiteCacheBuster(options.tokenKey, options.workspaceKey);
  if (!buster) return;
  const queries = queryClient
    .getQueryCache()
    .getAll()
    .filter(
      (query) =>
        query.state.status === 'success' &&
        query.state.data !== undefined &&
        allowed(query.queryKey, options.allow),
    )
    .map((query) => ({ queryKey: query.queryKey, data: query.state.data }));
  writeJsonSnapshot(options.storageKey, buster, queries);
}

function allowed(queryKey: readonly unknown[], allow: readonly QueryKeyPart[]): boolean {
  return allow.some((rule) => {
    if (typeof rule === 'string') return queryKey[0] === rule;
    return rule.every((part, index) => queryKey[index] === part);
  });
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  const entry = document.cookie.split('; ').find((item) => item.startsWith(prefix));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(prefix.length)) || null;
  } catch {
    return entry.slice(prefix.length) || null;
  }
}

function subjectFromAccessToken(token: string | null): string {
  if (!token) return '';
  const segment = token.split('.')[1];
  if (!segment) return '';
  try {
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = JSON.parse(atob(padded)) as { sub?: unknown };
    return typeof json.sub === 'string' ? json.sub : '';
  } catch {
    return '';
  }
}

/** Per-app browser cache. Live operational keys are intentionally absent. */
export const SUITE_APP_QUERY_CACHES = {
  kraken: {
    storageKey: 'kraken-query-cache:v1',
    tokenKey: 'kraken_access_token',
    workspaceKey: 'kraken_active_workspace_id',
    allow: ['kraken-sidebar'] as const,
  },
  shellstack: {
    storageKey: 'shellstack-query-cache:v1',
    tokenKey: 'portal_access_token',
    workspaceKey: 'portal_active_workspace_id',
    allow: ['calendar-events', 'org-workspaces', 'organisation', 'org-team', 'directory'] as const,
  },
  tides: {
    storageKey: 'tides-query-cache:v1',
    tokenKey: 'tides_access_token',
    workspaceKey: 'tides_active_workspace_id',
    allow: [
      ['tides', 'projects'],
      ['tides', 'clients'],
      ['tides', 'workspace-members'],
      ['tides', 'workspace-tags'],
      ['tides', 'project-statuses'],
    ] as const,
  },
  turtletime: {
    storageKey: 'tt-query-cache:v1',
    tokenKey: 'tt_access_token',
    workspaceKey: 'tt_active_workspace_id',
    allow: [
      ['tt', 'tracker-catalog'],
      ['tt', 'projects'],
      ['tt', 'clients'],
      ['tt', 'categories'],
    ] as const,
  },
  shelly: {
    storageKey: 'shelly-query-cache:v1',
    tokenKey: 'shelly_access_token',
    workspaceKey: 'shelly_active_workspace_id',
    allow: [
      ['shelly', 'skills'],
      ['shelly', 'crews'],
      ['shelly', 'mcp-servers'],
      ['shelly', 'models'],
    ] as const,
  },
} as const;
