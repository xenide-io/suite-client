import type { Api } from '../api/create-api-client';

/** Cross-app (suite) notification from `/api/notifications/` — shared across ShellStack apps. */
export interface SuiteNotification {
  id: string;
  title: string;
  body: string;
  href: string;
  kind: string;
  source_app: string;
  read_at: string | null;
  created_at: string;
  workspace: string | null;
  organisation: string | null;
}

export interface SuiteNotificationsResponse {
  notifications: SuiteNotification[];
  unread_count: number;
}

export interface NotificationsClientConfig {
  api: Api;
  parseApiError: (res: Response) => Promise<string>;
  cacheMs?: number;
  listPath?: string;
}

export type NotificationsClient = ReturnType<typeof createNotificationsClient>;

export function createNotificationsClient(config: NotificationsClientConfig) {
  const { api, parseApiError } = config;
  const CACHE_MS = config.cacheMs ?? 15_000;
  const LIST_PATH = config.listPath ?? '/api/notifications/';

  let notificationsCache: {
    data: SuiteNotificationsResponse;
    at: number;
  } | null = null;
  let notificationsInflight: Promise<SuiteNotificationsResponse> | null = null;

  async function fetchSuiteNotifications(): Promise<SuiteNotificationsResponse> {
    if (notificationsCache && Date.now() - notificationsCache.at < CACHE_MS) {
      return notificationsCache.data;
    }
    if (notificationsInflight) return notificationsInflight;
    notificationsInflight = (async () => {
      try {
        const res = await api.get(LIST_PATH);
        if (!res.ok) throw new Error(await parseApiError(res));
        const data = (await res.json()) as Partial<SuiteNotificationsResponse>;
        const result: SuiteNotificationsResponse = {
          notifications: data.notifications ?? [],
          unread_count: data.unread_count ?? 0,
        };
        notificationsCache = { data: result, at: Date.now() };
        return result;
      } finally {
        notificationsInflight = null;
      }
    })();
    return notificationsInflight;
  }

  async function markSuiteNotificationRead(id: string): Promise<void> {
    const res = await api.post(`${LIST_PATH}${id}/read/`);
    if (!res.ok) throw new Error(await parseApiError(res));
    notificationsCache = null;
  }

  async function markAllSuiteNotificationsRead(): Promise<void> {
    const res = await api.post(`${LIST_PATH}read-all/`);
    if (!res.ok) throw new Error(await parseApiError(res));
    notificationsCache = null;
  }

  return {
    fetchSuiteNotifications,
    markSuiteNotificationRead,
    markAllSuiteNotificationsRead,
  };
}
