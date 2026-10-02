export interface AuthReturnPathConfig {
  /** sessionStorage key holding the in-app return path, e.g. `tt_auth_return_to`. */
  returnKey: string;
  /** sessionStorage key caching the portal handoff payload. */
  handoffKey?: string;
  defaultNext?: string;
  portalCallbackPath?: string;
  redeemPath?: string;
}

export interface PortalHandoffPayload {
  code?: string;
  token?: string;
  access?: string;
  refresh?: string;
}

export interface PortalHandoffRead {
  code: string | null;
  token: string | null;
  refresh: string | null;
  next: string;
}

export type AuthReturnPath = ReturnType<typeof createAuthReturnPath>;

export function createAuthReturnPath(config: AuthReturnPathConfig) {
  const RETURN_KEY = config.returnKey;
  const HANDOFF_KEY = config.handoffKey ?? 'ss_portal_handoff';
  const DEFAULT_NEXT = config.defaultNext ?? '/today';
  const PORTAL_CALLBACK_PATH =
    config.portalCallbackPath ?? '/auth/portal/callback';
  const REDEEM_PATH = config.redeemPath ?? '/api/portal/auth/switch/redeem';

  function isSafeAuthReturnPath(
    path: string | null | undefined,
  ): path is string {
    if (
      !path ||
      path[0] !== '/' ||
      path.startsWith('//') ||
      path.startsWith('/\\')
    ) {
      return false;
    }
    if (path.includes('\\') || path.includes('://')) return false;
    return true;
  }

  function stashAuthReturnPath(path: string | null | undefined): void {
    if (typeof window === 'undefined' || !isSafeAuthReturnPath(path)) return;
    sessionStorage.setItem(RETURN_KEY, path);
  }

  function portalHandoffUrl(
    base: string,
    data: PortalHandoffPayload,
    next?: string,
    fallbackNext = DEFAULT_NEXT,
  ): string {
    const dest = isSafeAuthReturnPath(next) ? next : fallbackNext;
    const hash = new URLSearchParams();
    if (data.code) {
      hash.set('code', data.code);
    } else {
      const token = data.token || data.access || '';
      if (token) hash.set('token', token);
      if (data.refresh) hash.set('refresh', data.refresh);
    }
    hash.set('next', dest);
    return `${base.replace(/\/$/, '')}${PORTAL_CALLBACK_PATH}#${hash.toString()}`;
  }

  function cachedHandoff(fallbackNext: string): PortalHandoffRead | null {
    try {
      const raw = sessionStorage.getItem(HANDOFF_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PortalHandoffRead;
      if (!parsed.code && !parsed.token) return null;
      return {
        code: parsed.code || null,
        token: parsed.token || null,
        refresh: parsed.refresh || null,
        next: isSafeAuthReturnPath(parsed.next) ? parsed.next : fallbackNext,
      };
    } catch {
      sessionStorage.removeItem(HANDOFF_KEY);
      return null;
    }
  }

  function readPortalHandoff(fallbackNext = DEFAULT_NEXT): PortalHandoffRead {
    const cached = cachedHandoff(fallbackNext);
    if (cached) return cached;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const query = new URLSearchParams(window.location.search);
    const nextRaw = hash.get('next') || query.get('next');
    const result: PortalHandoffRead = {
      code: hash.get('code') || query.get('code'),
      token: hash.get('token') || query.get('token'),
      refresh: hash.get('refresh') || query.get('refresh'),
      next: isSafeAuthReturnPath(nextRaw) ? nextRaw : fallbackNext,
    };
    if (result.code || result.token) {
      sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(result));
    }
    // The callback's hard location.replace removes the fragment from history.
    // Calling history.replaceState here makes Next.js remount the callback before
    // its one-time code redemption has completed.
    return result;
  }

  let redeemInflight: Promise<PortalHandoffRead> | null = null;

  async function redeemPortalHandoff(
    apiUrl: string,
    fallbackNext = DEFAULT_NEXT,
  ): Promise<PortalHandoffRead> {
    redeemInflight ??= (async () => {
      const { code, token, refresh, next } = readPortalHandoff(fallbackNext);
      if (!code) return { code: null, token, refresh, next };
      const response = await fetch(`${apiUrl.replace(/\/$/, '')}${REDEEM_PATH}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      if (!response.ok) return { code: null, token: null, refresh: null, next };
      const data = (await response.json()) as PortalHandoffPayload;
      sessionStorage.removeItem(HANDOFF_KEY);
      return {
        code: null,
        token: data.token || data.access || null,
        refresh: data.refresh || null,
        next,
      };
    })();
    return redeemInflight;
  }

  function readAuthReturnPath(): string | null {
    if (typeof window === 'undefined') return null;
    const path = sessionStorage.getItem(RETURN_KEY);
    return isSafeAuthReturnPath(path) ? path : null;
  }

  function signInHrefWithReturn(fallbackRedirect?: string | null): string {
    const path = isSafeAuthReturnPath(fallbackRedirect)
      ? fallbackRedirect
      : readAuthReturnPath();
    if (!path) return '/login';
    return `/login?redirect=${encodeURIComponent(path)}`;
  }

  function registerHrefWithReturn(returnPath: string): string {
    return `/register?redirect=${encodeURIComponent(returnPath)}`;
  }

  return {
    isSafeAuthReturnPath,
    stashAuthReturnPath,
    portalHandoffUrl,
    readPortalHandoff,
    redeemPortalHandoff,
    readAuthReturnPath,
    signInHrefWithReturn,
    registerHrefWithReturn,
  };
}
