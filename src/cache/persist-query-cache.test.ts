import { describe, expect, it } from 'vitest';
import {
  persistSuiteQueries,
  readJsonSnapshot,
  SUITE_APP_QUERY_CACHES,
  SUITE_QUERY_CACHE_MAX_AGE_MS,
  suiteCacheBuster,
  writeJsonSnapshot,
  type PersistableQuery,
  type PersistableQueryClient,
} from './persist-query-cache';

function token(sub: string): string {
  const payload = btoa(JSON.stringify({ sub }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `a.${payload}.c`;
}

describe('suite query snapshots', () => {
  it('refuses another user or workspace', () => {
    localStorage.setItem('app_access_token', token('user-a'));
    localStorage.setItem('app_workspace', 'ws-1');
    writeJsonSnapshot('snap', suiteCacheBuster('app_access_token', 'app_workspace'), {
      ok: true,
    });
    expect(readJsonSnapshot('snap', suiteCacheBuster('app_access_token', 'app_workspace'), 1000)).toEqual({
      ok: true,
    });
    localStorage.setItem('app_workspace', 'ws-2');
    expect(readJsonSnapshot('snap', suiteCacheBuster('app_access_token', 'app_workspace'), 1000)).toBeNull();
  });

  it('restores allow-listed queries and marks them stale', async () => {
    localStorage.setItem('app_access_token', token('user-a'));
    localStorage.setItem('app_workspace', 'ws-1');
    const invalidated: unknown[][] = [];
    const queries: PersistableQuery[] = [
      {
        queryKey: ['calendar-events', 'ws-1'],
        state: { status: 'success', data: { events: [1] } },
      },
      {
        queryKey: ['billing', 'secret'],
        state: { status: 'success', data: { card: 'no' } },
      },
    ];
    const client: PersistableQueryClient = {
      getQueryCache: () => ({
        getAll: () => queries,
        subscribe: () => () => undefined,
      }),
      setQueryData: (queryKey, data) => {
        queries.push({
          queryKey,
          state: { status: 'success', data },
        });
      },
      invalidateQueries: async ({ queryKey }) => {
        invalidated.push([...queryKey]);
      },
    };
    writeJsonSnapshot('app-query-cache:v1', suiteCacheBuster('app_access_token', 'app_workspace'), [
      { queryKey: ['calendar-events', 'ws-1'], data: { events: [1] } },
      { queryKey: ['billing', 'secret'], data: { card: 'no' } },
    ]);

    persistSuiteQueries(client, {
      storageKey: 'app-query-cache:v1',
      tokenKey: 'app_access_token',
      workspaceKey: 'app_workspace',
      allow: ['calendar-events'],
    });

    expect(invalidated).toEqual([['calendar-events', 'ws-1']]);
  });

  it('restores each app catalogue and leaves live queries to the network', () => {
    const liveKeys = {
      kraken: ['kraken-document-attachments', 'doc-1'],
      shellstack: ['billing', 'org-1'],
      tides: ['tides', 'task-detail', 'task-1'],
      turtletime: ['tt', 'time-entries', 'today'],
      shelly: ['shelly', 'runs', 'running'],
    } as const;

    for (const [app, config] of Object.entries(SUITE_APP_QUERY_CACHES)) {
      localStorage.clear();
      localStorage.setItem(config.tokenKey, token(`${app}-user`));
      localStorage.setItem(config.workspaceKey, `${app}-ws`);
      const allowedKey = Array.isArray(config.allow[0]) ? [...config.allow[0]] : [config.allow[0]];
      const liveKey = [...liveKeys[app as keyof typeof liveKeys]];
      const invalidated: unknown[][] = [];
      const client: PersistableQueryClient = {
        getQueryCache: () => ({
          getAll: () => [],
          subscribe: () => () => undefined,
        }),
        setQueryData: () => undefined,
        invalidateQueries: async ({ queryKey }) => {
          invalidated.push([...queryKey]);
        },
      };
      writeJsonSnapshot(config.storageKey, suiteCacheBuster(config.tokenKey, config.workspaceKey), [
        { queryKey: allowedKey, data: { fresh: false, painted: true } },
        { queryKey: liveKey, data: { must: 'not-paint' } },
      ]);

      persistSuiteQueries(client, config);

      expect(invalidated, app).toEqual([allowedKey]);
      localStorage.setItem(config.workspaceKey, 'someone-else');
      const foreign: unknown[][] = [];
      persistSuiteQueries(
        {
          ...client,
          invalidateQueries: async ({ queryKey }) => {
            foreign.push([...queryKey]);
          },
        },
        config,
      );
      expect(foreign, app).toEqual([]);
    }
  });

  it('drops a snapshot after the maximum age so a reload cannot stay stale', () => {
    localStorage.setItem('app_access_token', token('user-a'));
    localStorage.setItem('app_workspace', 'ws-1');
    const buster = suiteCacheBuster('app_access_token', 'app_workspace');
    writeJsonSnapshot('aged', buster, { painted: true });
    const raw = localStorage.getItem('aged');
    const stored = JSON.parse(raw ?? '{}') as { savedAt: number };
    stored.savedAt = Date.now() - SUITE_QUERY_CACHE_MAX_AGE_MS - 1;
    localStorage.setItem('aged', JSON.stringify(stored));
    expect(readJsonSnapshot('aged', buster, SUITE_QUERY_CACHE_MAX_AGE_MS)).toBeNull();
  });
});
