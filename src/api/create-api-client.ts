import { appErrorFromResponse, formatAppError } from '../errors/normalize';

export interface ApiClientConfig {
  /** localStorage key namespace, e.g. `tt` or `tides`. */
  storagePrefix: string;
  /** Backend refresh endpoint, e.g. `/api/turtletime/auth/refresh/`. */
  refreshPath: string;
  /** Overrides `NEXT_PUBLIC_API_URL` / `http://localhost:8000`. */
  baseUrl?: string;
  accessTokenKey?: string;
  refreshTokenKey?: string;
  workspaceKey?: string;
  /** Suite-wide workspace cookie name. */
  workspaceCookieName?: string;
  /** Overrides `NEXT_PUBLIC_WORKSPACE_COOKIE_DOMAIN`. */
  workspaceCookieDomain?: string;
  /** Fired when the active workspace changes in this tab. */
  onWorkspaceChange?: (id: string | null) => void;
  /** sessionStorage key prefixes to clear on sign-out. */
  sessionStorageClearPrefixes?: string[];
}

export type ApiFetch = (
  path: string,
  options?: RequestInit,
) => Promise<Response>;

/**
 * Build a browser API client scoped to one ShellStack app. Every app shares the
 * same fetch/refresh/workspace behaviour; only the storage namespace and
 * refresh path differ.
 */
export function createApiClient(config: ApiClientConfig) {
  const API_URL =
    config.baseUrl ??
    process.env.NEXT_PUBLIC_API_URL ??
    'http://localhost:8000';

  // Suite-wide workspace selection. Cookies (unlike localStorage) are shared
  // across ports/subdomains, so every product app reads the same value. Set
  // NEXT_PUBLIC_WORKSPACE_COOKIE_DOMAIN (e.g. ".xenide.io") to share across
  // subdomains in production; leave unset for localhost.
  const SHARED_WORKSPACE_COOKIE =
    config.workspaceCookieName ?? 'xenide_active_workspace_id';
  const SHARED_WORKSPACE_COOKIE_DOMAIN =
    config.workspaceCookieDomain ??
    process.env.NEXT_PUBLIC_WORKSPACE_COOKIE_DOMAIN;

  const ACCESS_KEY = config.accessTokenKey ?? `${config.storagePrefix}_access_token`;
  const REFRESH_KEY =
    config.refreshTokenKey ?? `${config.storagePrefix}_refresh_token`;
  const WORKSPACE_KEY =
    config.workspaceKey ?? `${config.storagePrefix}_active_workspace_id`;

  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let activeWorkspaceId: string | null = null;

  let authFailureHandler: (() => void) | null = null;
  let authFailureFired = false;
  let refreshPromise: Promise<boolean> | null = null;

  function readSharedWorkspaceId(): string | null {
    if (typeof document === 'undefined') return null;
    const prefix = `${SHARED_WORKSPACE_COOKIE}=`;
    const entry = document.cookie
      .split('; ')
      .find((item) => item.startsWith(prefix));
    if (!entry) return null;
    const raw = entry.slice(prefix.length);
    if (!raw) return null;
    try {
      return decodeURIComponent(raw) || null;
    } catch {
      return raw;
    }
  }

  function writeSharedWorkspaceId(id: string | null): void {
    if (typeof document === 'undefined') return;
    const value = id ? encodeURIComponent(id) : '';
    const maxAge = id ? 60 * 60 * 24 * 365 : 0;
    const domain = SHARED_WORKSPACE_COOKIE_DOMAIN
      ? `; domain=${SHARED_WORKSPACE_COOKIE_DOMAIN}`
      : '';
    document.cookie = `${SHARED_WORKSPACE_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax${domain}`;
  }

  function onAuthFailure(handler: () => void): void {
    authFailureHandler = handler;
    authFailureFired = false;
  }

  function triggerAuthFailure(): void {
    if (authFailureFired) return;
    authFailureFired = true;
    authFailureHandler?.();
  }

  function setTokens(access: string, refresh: string): void {
    accessToken = access;
    refreshToken = refresh;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(ACCESS_KEY, access);
      window.localStorage.setItem(REFRESH_KEY, refresh);
    }
  }

  function getAccessToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
      accessToken = window.localStorage.getItem(ACCESS_KEY);
    }
    return accessToken;
  }

  function getRefreshToken(): string | null {
    if (refreshToken) return refreshToken;
    if (typeof window !== 'undefined') {
      refreshToken = window.localStorage.getItem(REFRESH_KEY);
    }
    return refreshToken;
  }

  function setActiveWorkspaceId(
    id: string | null,
    options?: { share?: boolean },
  ): void {
    const changed = activeWorkspaceId !== id;
    activeWorkspaceId = id;
    if (typeof window !== 'undefined') {
      if (id) {
        window.localStorage.setItem(WORKSPACE_KEY, id);
      } else {
        window.localStorage.removeItem(WORKSPACE_KEY);
      }
      if (changed) config.onWorkspaceChange?.(id);
    }
    // Only an explicit choice should update the suite-wide selection; a fallback
    // default must not clobber the workspace another app is using.
    if (options?.share) writeSharedWorkspaceId(id);
  }

  function getActiveWorkspaceId(): string | null {
    if (activeWorkspaceId) return activeWorkspaceId;
    if (typeof window !== 'undefined') {
      activeWorkspaceId =
        readSharedWorkspaceId() ?? window.localStorage.getItem(WORKSPACE_KEY);
    }
    return activeWorkspaceId;
  }

  function restoreWorkspace(): void {
    if (typeof window !== 'undefined') {
      activeWorkspaceId =
        readSharedWorkspaceId() ?? window.localStorage.getItem(WORKSPACE_KEY);
    }
  }

  function clearAuth(): void {
    accessToken = null;
    refreshToken = null;
    activeWorkspaceId = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(ACCESS_KEY);
      window.localStorage.removeItem(REFRESH_KEY);
      window.localStorage.removeItem(WORKSPACE_KEY);
      const prefixes = config.sessionStorageClearPrefixes ?? [];
      if (prefixes.length > 0) {
        try {
          for (let i = window.sessionStorage.length - 1; i >= 0; i -= 1) {
            const key = window.sessionStorage.key(i);
            if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
              window.sessionStorage.removeItem(key);
            }
          }
        } catch {
          // ignore storage access errors
        }
      }
    }
  }

  function restoreTokens(): void {
    if (typeof window !== 'undefined') {
      accessToken = window.localStorage.getItem(ACCESS_KEY);
      refreshToken = window.localStorage.getItem(REFRESH_KEY);
      activeWorkspaceId =
        readSharedWorkspaceId() ?? window.localStorage.getItem(WORKSPACE_KEY);
    }
  }

  async function refreshAccessToken(): Promise<boolean> {
    if (refreshPromise) return refreshPromise;
    refreshPromise = refreshAccessTokenInternal().finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  }

  async function refreshAccessTokenInternal(): Promise<boolean> {
    const refresh = getRefreshToken();
    if (!refresh) {
      triggerAuthFailure();
      return false;
    }

    try {
      const res = await fetch(`${API_URL}${config.refreshPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });
      if (!res.ok) {
        clearAuth();
        triggerAuthFailure();
        return false;
      }
      const data = await res.json();
      setTokens(data.access, data.refresh);
      authFailureFired = false;
      return true;
    } catch {
      clearAuth();
      triggerAuthFailure();
      return false;
    }
  }

  async function apiFetch(
    path: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const body = options.body;
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const wsId = getActiveWorkspaceId();
    if (wsId) {
      headers['X-Active-Workspace-Id'] = wsId;
    }

    const url = path.startsWith('http') ? path : `${API_URL}${path}`;

    async function doFetch(): Promise<Response> {
      try {
        return await fetch(url, { ...options, headers });
      } catch {
        throw new Error(
          `Could not reach the API at ${API_URL}. Is the Django backend running?`,
        );
      }
    }

    let res = await doFetch();

    if (res.status === 401 && token) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = getAccessToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
        }
        res = await doFetch();
        if (res.status === 401) {
          triggerAuthFailure();
        }
      }
    }

    return res;
  }

  async function parseApiError(res: Response): Promise<string> {
    // Never render upstream text or a status number: normalise, then show the code.
    return formatAppError(await appErrorFromResponse(res));
  }

  const api = {
    get: (path: string) => apiFetch(path),

    post: (path: string, body?: unknown, options: RequestInit = {}) =>
      apiFetch(path, {
        ...options,
        method: 'POST',
        body:
          body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined,
      }),

    put: (path: string, body?: unknown) =>
      apiFetch(path, {
        method: 'PUT',
        body:
          body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined,
      }),

    patch: (path: string, body?: unknown) =>
      apiFetch(path, {
        method: 'PATCH',
        body:
          body instanceof FormData
            ? body
            : body
              ? JSON.stringify(body)
              : undefined,
      }),

    delete: (path: string) => apiFetch(path, { method: 'DELETE' }),
  };

  return {
    API_URL,
    onAuthFailure,
    setTokens,
    getAccessToken,
    getRefreshToken,
    setActiveWorkspaceId,
    getActiveWorkspaceId,
    restoreWorkspace,
    clearAuth,
    restoreTokens,
    refreshAccessToken,
    parseApiError,
    api,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
export type Api = ApiClient['api'];
