import { beforeEach, describe, expect, it, vi } from 'vitest';
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

    const fetchMock = vi.fn().mockResolvedValue(
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
