import posthog from 'posthog-js';
import type { ConfigDefaults } from 'posthog-js';

/**
 * Global super-properties and event properties accepted by the analytics client.
 * Values may be `null` to clear a previously registered super-property.
 */
export type AnalyticsProperties = Record<string, unknown>;

/** Headers forwarded on every API request so server events share the web identity. */
export type AnalyticsContextHeaders = Record<string, string>;

export interface AnalyticsClientConfig {
  /** `NEXT_PUBLIC_POSTHOG_KEY`. A missing key makes the client a no-op. */
  apiKey?: string;
  /** `NEXT_PUBLIC_POSTHOG_HOST`, e.g. `https://us.i.posthog.com`. */
  host?: string;
  /** Global `app` super-property, e.g. `turtletime`. */
  app: string;
  /** Global `environment` super-property; defaults to `NODE_ENV`. */
  environment?: string;
  /** PostHog config defaults date. Defaults to `2026-05-30`. */
  defaults?: ConfigDefaults;
}

export type AnalyticsClient = ReturnType<typeof createAnalyticsClient>;

const DEFAULT_HOST = 'https://us.i.posthog.com';
const DEFAULT_DEFAULTS: ConfigDefaults = '2026-05-30';

/**
 * Consent has not been implemented yet (AN-06).
 *
 * All five apps initialise PostHog on load and rely on PostHog's legitimate
 * interest default: no banner, no opt-in gate, and GeoIP (`$geoip_*`/`$ip`) is
 * left at the SDK default. Keep this flag `false` until a real consent banner
 * exists; when it becomes `true`, call `posthog.opt_out_capturing()` before
 * init and only opt in after the visitor accepts. Session recording stays
 * explicitly disabled below so consent can never be back-filled silently.
 */
export const ANALYTICS_CONSENT_REQUIRED = false;

/**
 * Lifecycle actions with two emitters in the same tick: the api-client
 * lifecycle hook (`Session Expired`, `User Logged Out`) and an app-level
 * button/menu that captures the same move before or after it. The first
 * capture wins for a short window, so one action emits once.
 *
 * Other duplicated actions (theme, command palette, cross-app switch) are
 * resolved at their owner instead: ShellStack's provider ignores the shared
 * `the-old-ui` copy because the app captures them directly, and a full page
 * load/cross-origin handoff starts a new client anyway. Those pairs are
 * correlated by person + `$session_id`.
 */
const DEDUPE_EVENTS = new Set(['User Logged Out', 'Session Expired']);

/** Events that carry a generated `action_id` for client/server correlation. */
const ACTION_EVENTS = new Set([
  'Theme Updated',
  'Command Palette Action',
  'User Logged Out',
  'Session Expired',
  'Cross-App Switch',
]);
const DEDUPE_WINDOW_MS = 500;

function newActionId(): string {
  const cryptoApi =
    typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoApi && typeof cryptoApi.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/** Domain half of an email — safe to send; the raw address is not. */
export function emailDomain(email: string | null | undefined): string | undefined {
  if (!email) return undefined;
  const at = email.indexOf('@');
  return at === -1 ? undefined : email.slice(at + 1).toLowerCase() || undefined;
}

/**
 * Browser analytics client shared across ShellStack apps.
 *
 * Wraps `posthog-js` so every app initialises the same way, registers the same
 * global super-properties, and forwards the browser identity/session ids to the
 * API. Autocapture and PostHog's UTM/browser/referrer context stay on; pageviews
 * are owned explicitly by the app providers, pageleaves by the SDK's
 * pagehide/unload hook, and session recording is opt-in only (currently off).
 */
export function createAnalyticsClient(config: AnalyticsClientConfig) {
  const apiKey = (config.apiKey ?? '').trim();
  const host = (config.host ?? '').trim() || DEFAULT_HOST;
  const environment = config.environment ?? process.env.NODE_ENV ?? 'unknown';
  const defaults = config.defaults ?? DEFAULT_DEFAULTS;

  let initialized = false;

  /**
   * Last capture timestamp per deduped lifecycle event. Scoped to this client
   * so tests and multiple app bundles never share a window.
   */
  const dedupeUntil = new Map<string, number>();

  /** Last explicit pageview, so a double-mounted effect cannot count twice. */
  let lastPageviewPath = '';
  let lastPageviewAt = 0;

  function isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  /** Idempotent, browser-only init. No-ops without a project key. */
  function init(): void {
    if (initialized || !isBrowser() || !apiKey) return;
    initialized = true;
    posthog.init(apiKey, {
      api_host: host,
      defaults,
      person_profiles: 'identified_only',
      autocapture: true,
      // Pageviews are captured explicitly via `pageview()` (mount + route
      // change) so every `$pageview` carries the app/super-properties and the
      // behaviour is identical across all apps. The SDK's own pageview capture
      // is disabled to avoid double-counting and `defaults`-dependent behaviour.
      capture_pageview: false,
      // PostHog's SPA guidance: the SDK emits `$pageleave` on pagehide/unload,
      // and the next `$pageview` carries `$prev_pageview_*` duration/scroll
      // properties for the page that was left. There is no second, manual
      // pageleave, so internal route changes never double-count.
      capture_pageleave: true,
      // TODO(AN-06): enable only after a consent gate and input masking exist.
      // Recording is never switched on silently by a defaults bump.
      disable_session_recording: true,
      persistence: 'localStorage+cookie',
      cross_subdomain_cookie: true,
    });
    posthog.register({ app: config.app, environment });
    if (ANALYTICS_CONSENT_REQUIRED) {
      // TODO(AN-06): swap this blanket opt-out for a stored consent decision;
      // `opt_in_capturing()` only after the visitor accepts.
      posthog.opt_out_capturing();
    }
  }

  /** Ensure init ran, then report whether the SDK is usable. */
  function active(): boolean {
    init();
    return initialized;
  }

  function identify(
    userId: string,
    props?: AnalyticsProperties,
    setOnceProps?: AnalyticsProperties,
  ): void {
    if (!active() || !userId) return;
    posthog.identify(userId, props, setOnceProps);
  }

  function group(
    groupType: string,
    groupKey: string,
    props?: AnalyticsProperties,
  ): void {
    if (!active() || !groupType || !groupKey) return;
    posthog.group(groupType, groupKey, props);
  }

  function capture(event: string, props?: AnalyticsProperties): void {
    if (!active() || !event) return;
    const now = Date.now();
    if (DEDUPE_EVENTS.has(event)) {
      const until = dedupeUntil.get(event);
      if (until !== undefined && now < until) return;
      dedupeUntil.set(event, now + DEDUPE_WINDOW_MS);
    }
    // Give every lifecycle event a stable id for joins with any future server
    // copy. Client/server pairs that already exist (User Logged Out) share
    // `$session_id`; the server does not receive this id because the CORS
    // allow-list is outside this package's boundary.
    if (ACTION_EVENTS.has(event) && props?.action_id === undefined) {
      posthog.capture(event, { ...props, action_id: newActionId() });
      return;
    }
    posthog.capture(event, props);
  }

  function reset(): void {
    if (!active()) return;
    dedupeUntil.clear();
    posthog.reset();
  }

  function getDistinctId(): string | undefined {
    if (!active()) return undefined;
    return posthog.get_distinct_id() || undefined;
  }

  function getSessionId(): string | undefined {
    if (!active()) return undefined;
    return posthog.get_session_id() || undefined;
  }

  /**
   * Capture the one `$pageview` for the current route. `capture_pageview` is
   * off, so this is the only pageview emitter. A short same-URL guard absorbs
   * React StrictMode's double-invoked effect without suppressing a later visit.
   */
  function pageview(): void {
    if (!active()) return;
    const path =
      typeof window === 'undefined'
        ? ''
        : `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const now = Date.now();
    if (
      path &&
      path === lastPageviewPath &&
      now - lastPageviewAt < DEDUPE_WINDOW_MS
    ) {
      return;
    }
    lastPageviewPath = path;
    lastPageviewAt = now;
    posthog.capture('$pageview');
  }

  /**
   * Register (or clear) global super-properties. `null` values unregister the
   * key so stale workspace/org context never leaks onto later events.
   */
  function registerSuperProperties(props: AnalyticsProperties): void {
    if (!active()) return;
    const toRegister: AnalyticsProperties = {};
    const toUnregister: string[] = [];
    for (const [key, value] of Object.entries(props)) {
      if (value === undefined) continue;
      if (value === null) toUnregister.push(key);
      else toRegister[key] = value;
    }
    if (Object.keys(toRegister).length > 0) posthog.register(toRegister);
    for (const key of toUnregister) posthog.unregister(key);
  }

  /** Identity/session headers for the API client; omits unavailable values. */
  function getContextHeaders(): AnalyticsContextHeaders {
    const headers: AnalyticsContextHeaders = {};
    const distinctId = getDistinctId();
    if (distinctId) headers['X-POSTHOG-DISTINCT-ID'] = distinctId;
    const sessionId = getSessionId();
    if (sessionId) headers['X-POSTHOG-SESSION-ID'] = sessionId;
    return headers;
  }

  // Initialise as soon as the module loads on the browser (idempotent), so the
  // SDK and identity/session ids are ready before the first API request and the
  // first `identify()` call. SSR is a no-op.
  if (isBrowser()) init();

  return {
    init,
    identify,
    group,
    capture,
    reset,
    getDistinctId,
    getSessionId,
    pageview,
    registerSuperProperties,
    getContextHeaders,
  };
}
