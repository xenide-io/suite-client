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
 * API. The SDK keeps PostHog's defaults (autocapture, pageviews, UTM, browser/OS,
 * referrer) — nothing here disables them.
 */
export function createAnalyticsClient(config: AnalyticsClientConfig) {
  const apiKey = (config.apiKey ?? '').trim();
  const host = (config.host ?? '').trim() || DEFAULT_HOST;
  const environment = config.environment ?? process.env.NODE_ENV ?? 'unknown';
  const defaults = config.defaults ?? DEFAULT_DEFAULTS;

  let initialized = false;

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
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
      cross_subdomain_cookie: true,
    });
    posthog.register({ app: config.app, environment });
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
    posthog.capture(event, props);
  }

  function reset(): void {
    if (!active()) return;
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

  function pageview(): void {
    if (!active()) return;
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
