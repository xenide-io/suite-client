import type { Api } from '../api/create-api-client';

/** Browser push state surfaced to settings UI. */
export type WebPushState =
  | 'unsupported'
  | 'unconfigured'
  | 'default'
  | 'granted'
  | 'denied'
  | 'subscribed';

export interface WebPushConfig {
  enabled: boolean;
  public_key: string;
}

export interface WebPushClientConfig {
  api: Api;
  parseApiError: (res: Response) => Promise<string>;
  publicKeyPath?: string;
  subscribePath?: string;
  unsubscribePath?: string;
  serviceWorkerPath?: string;
  serviceWorkerScope?: string;
}

export type WebPushClient = ReturnType<typeof createWebPushClient>;

/**
 * Browser Web Push client shared across ShellStack apps.
 *
 * Registration is per origin: each app ships its own `/sw.js` and manifest,
 * but all talk to the same suite endpoints, so a subscription made in one app
 * receives notifications for the whole suite.
 */
export function createWebPushClient(config: WebPushClientConfig) {
  const { api, parseApiError } = config;
  const PUBLIC_KEY_PATH =
    config.publicKeyPath ?? '/api/notifications/push/public-key/';
  const SUBSCRIBE_PATH =
    config.subscribePath ?? '/api/notifications/push/subscribe/';
  const UNSUBSCRIBE_PATH =
    config.unsubscribePath ?? '/api/notifications/push/unsubscribe/';
  const SW_PATH = config.serviceWorkerPath ?? '/sw.js';
  const SW_SCOPE = config.serviceWorkerScope ?? '/';

  function supported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  async function fetchConfig(): Promise<WebPushConfig> {
    const res = await api.get(PUBLIC_KEY_PATH);
    if (!res.ok) throw new Error(await parseApiError(res));
    return (await res.json()) as WebPushConfig;
  }

  async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
    const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    return existing ?? null;
  }

  function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
    const padding = '='.repeat((4 - (base64.length % 4)) % 4);
    const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(normalized);
    const output = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) {
      output[i] = raw.charCodeAt(i);
    }
    return output;
  }

  async function getState(): Promise<WebPushState> {
    if (!supported()) return 'unsupported';
    let cfg: WebPushConfig;
    try {
      cfg = await fetchConfig();
    } catch {
      return 'unconfigured';
    }
    if (!cfg.enabled || !cfg.public_key) return 'unconfigured';
    if (Notification.permission === 'denied') return 'denied';
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (subscription && Notification.permission === 'granted') {
      return 'subscribed';
    }
    if (Notification.permission === 'granted') return 'granted';
    return 'default';
  }

  async function enable(): Promise<void> {
    if (!supported()) {
      throw new Error('This browser does not support notifications.');
    }

    // Ask for permission first: browsers require it in response to the user
    // gesture, and an awaited request can expire that activation.
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission was not granted.');
    }

    const cfg = await fetchConfig();
    if (!cfg.enabled || !cfg.public_key) {
      throw new Error('Push notifications are not configured on the server.');
    }

    let registration = await getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register(SW_PATH, {
        scope: SW_SCOPE,
      });
    }
    await navigator.serviceWorker.ready;

    const existing = await registration.pushManager.getSubscription();
    const subscription =
      existing ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(cfg.public_key),
      }));

    const json = subscription.toJSON() as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      throw new Error('The browser returned an incomplete push subscription.');
    }

    const res = await api.post(SUBSCRIBE_PATH, {
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    });
    if (!res.ok) throw new Error(await parseApiError(res));
  }

  async function disable(): Promise<void> {
    if (!supported()) return;
    const registration = await getRegistration();
    const subscription = await registration?.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    try {
      await subscription.unsubscribe();
    } catch {
      // Already gone — still tell the server to stop sending.
    }

    const res = await api.post(UNSUBSCRIBE_PATH, { endpoint });
    if (!res.ok) throw new Error(await parseApiError(res));
  }

  return { supported, getState, enable, disable };
}
