import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../api/create-api-client';
import { createWebPushClient } from './create-web-push-client';

function makeClient() {
  const api = createApiClient({
    storagePrefix: 'test',
    refreshPath: '/api/test/auth/refresh/',
    baseUrl: 'https://api.example.test',
  });
  return createWebPushClient({
    api: api.api,
    parseApiError: api.parseApiError,
  });
}

function stubFetch(
  handler: (url: string, init?: RequestInit) => Response,
): ReturnType<typeof vi.fn> {
  const mock = vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    Promise.resolve(handler(String(input), init)),
  );
  vi.stubGlobal('fetch', mock);
  return mock;
}

function stubPushEnv({
  permission = 'default',
  requestResult = 'granted',
}: {
  permission?: NotificationPermission;
  requestResult?: NotificationPermission;
} = {}) {
  const subscribe = vi.fn().mockResolvedValue({
    endpoint: 'https://push.example/sub',
    toJSON: () => ({
      endpoint: 'https://push.example/sub',
      keys: { p256dh: 'p256dh', auth: 'auth' },
    }),
    unsubscribe: vi.fn().mockResolvedValue(true),
  });
  const registration = {
    pushManager: {
      getSubscription: vi.fn().mockResolvedValue(null),
      subscribe,
    },
  };
  vi.stubGlobal('PushManager', function PushManager() {});
  vi.stubGlobal('Notification', {
    permission,
    requestPermission: vi.fn().mockResolvedValue(requestResult),
  });
  Object.defineProperty(window.navigator, 'serviceWorker', {
    configurable: true,
    value: {
      getRegistration: vi.fn().mockResolvedValue(null),
      register: vi.fn().mockResolvedValue(registration),
      ready: Promise.resolve(registration),
    },
  });
  return { registration, subscribe };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createWebPushClient', () => {
  it('reports unsupported without the Push API', () => {
    expect(makeClient().supported()).toBe(false);
  });

  it('reports unconfigured when the server has no VAPID keys', async () => {
    stubPushEnv();
    stubFetch(
      () =>
        new Response(JSON.stringify({ enabled: false, public_key: '' }), {
          status: 200,
        }),
    );
    expect(await makeClient().getState()).toBe('unconfigured');
  });

  it('reports denied when permission is blocked', async () => {
    stubPushEnv({ permission: 'denied' });
    stubFetch(
      () =>
        new Response(JSON.stringify({ enabled: true, public_key: 'BAAA' }), {
          status: 200,
        }),
    );
    expect(await makeClient().getState()).toBe('denied');
  });

  it('subscribes and registers the subscription with the server', async () => {
    stubPushEnv();
    const calls: Array<{ url: string; body: unknown }> = [];
    stubFetch((url, init) => {
      calls.push({ url, body: init?.body });
      return new Response(
        JSON.stringify({ ok: true, enabled: true, public_key: 'BAAA' }),
        { status: url.includes('/push/subscribe/') ? 201 : 200 },
      );
    });

    await makeClient().enable();

    const subscribeCall = calls.find((c) => c.url.includes('/push/subscribe/'));
    expect(subscribeCall).toBeDefined();
    const body = JSON.parse(String(subscribeCall?.body));
    expect(body.endpoint).toBe('https://push.example/sub');
    expect(body.keys).toEqual({ p256dh: 'p256dh', auth: 'auth' });
  });

  it('throws when permission is refused', async () => {
    stubPushEnv({ requestResult: 'denied' });
    await expect(makeClient().enable()).rejects.toThrow(
      'Notification permission was not granted.',
    );
  });
});
