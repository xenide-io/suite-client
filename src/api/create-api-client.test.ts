import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from './create-api-client';

function client() {
  return createApiClient({
    storagePrefix: 'test',
    refreshPath: '/api/test/auth/refresh/',
    baseUrl: 'https://api.example.test',
  });
}

describe('createApiClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shares concurrent default GETs but gives each consumer a readable body', async () => {
    const api = client().api;
    let resolve!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const first = api.get('/members');
    const second = api.get('/members');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolve(Response.json({ members: [1] }));
    const responses = await Promise.all([first, second]);
    expect(
      await Promise.all(responses.map((response) => response.json())),
    ).toEqual([{ members: [1] }, { members: [1] }]);
    fetchMock.mockResolvedValue(Response.json({ members: [2] }));
    expect(await (await api.get('/members')).json()).toEqual({ members: [2] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not share reads across query strings, workspaces, tokens or explicit options', async () => {
    const api = client();
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    void api.api.get('/members');
    void api.api.get('/members?page=2');
    api.setActiveWorkspaceId('another');
    void api.api.get('/members');
    api.setTokens('another-user');
    void api.api.get('/members');
    void api.api.get('/members', { signal: new AbortController().signal });
    void api.api.get('/members', { headers: { 'Accept-Language': 'en-AU' } });
    expect(fetchMock).toHaveBeenCalledTimes(6);
  });

  it('does not reuse a pre-mutation read and does not share writes', async () => {
    const api = client().api;
    const fetchMock = vi.fn(() => new Promise<Response>(() => {}));
    vi.stubGlobal('fetch', fetchMock);
    void api.get('/members');
    void api.post('/members', { name: 'A' });
    void api.post('/members', { name: 'A' });
    void api.get('/members');
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('clears failed in-flight reads so a later call can retry', async () => {
    const api = client().api;
    const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline'));
    vi.stubGlobal('fetch', fetchMock);
    const reads = await Promise.allSettled([
      api.get('/members'),
      api.get('/members'),
    ]);
    expect(reads.map((read) => read.status)).toEqual(['rejected', 'rejected']);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockResolvedValue(Response.json({ members: [] }));
    expect((await api.get('/members')).ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('preserves token refresh and ETag revalidation for shared reads', async () => {
    const api = client();
    api.setTokens('expired', 'refresh');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ access: 'renewed' }))
      .mockResolvedValueOnce(
        Response.json({ members: [1] }, { headers: { ETag: 'v1' } }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 304 }));
    vi.stubGlobal('fetch', fetchMock);
    const responses = await Promise.all([
      api.api.get('/members'),
      api.api.get('/members'),
    ]);
    expect(
      await Promise.all(responses.map((response) => response.json())),
    ).toEqual([{ members: [1] }, { members: [1] }]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(api.getAccessToken()).toBe('renewed');
    expect(await (await api.api.get('/members')).json()).toEqual({
      members: [1],
    });
    expect(fetchMock.mock.calls[3][1].headers['If-None-Match']).toBe('v1');
  });

  it('stores and restores tokens under the prefix', () => {
    const api = client();
    api.setTokens('access-1', 'refresh-1');
    expect(window.localStorage.getItem('test_access_token')).toBe('access-1');

    const restored = client();
    restored.restoreTokens();
    expect(restored.getAccessToken()).toBe('access-1');
    expect(restored.getRefreshToken()).toBe('refresh-1');
  });

  it('sends bearer and workspace headers', async () => {
    const api = client();
    api.setTokens('tok', 'ref');
    api.setActiveWorkspaceId('ws-1');

    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );
    vi.stubGlobal('fetch', fetchMock);

    await api.api.get('/api/thing/');
    const [, init] = fetchMock.mock.calls[0];
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://api.example.test/api/thing/',
    );
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(init.headers['X-Active-Workspace-Id']).toBe('ws-1');

    vi.unstubAllGlobals();
  });

  it('clears auth state on sign-out', () => {
    const api = client();
    api.setTokens('tok', 'ref');
    api.setActiveWorkspaceId('ws-1');
    api.clearAuth();
    expect(window.localStorage.getItem('test_access_token')).toBeNull();
    expect(window.localStorage.getItem('test_active_workspace_id')).toBeNull();
  });
});
