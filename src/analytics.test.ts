import { beforeEach, describe, expect, it, vi } from 'vitest';

const posthog = vi.hoisted(() => ({
  init: vi.fn(),
  register: vi.fn(),
  unregister: vi.fn(),
  identify: vi.fn(),
  group: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn(),
  get_distinct_id: vi.fn(() => 'distinct-123'),
  get_session_id: vi.fn(() => 'session-456'),
}));

vi.mock('posthog-js', () => ({ default: posthog }));

import { createAnalyticsClient, emailDomain, ANALYTICS_CONSENT_REQUIRED } from './analytics';

describe('consent flag', () => {
  it('documents that no consent gate exists yet', () => {
    expect(ANALYTICS_CONSENT_REQUIRED).toBe(false);
  });
});

describe('createAnalyticsClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a no-op without an api key', () => {
    const analytics = createAnalyticsClient({ app: 'turtletime' });
    analytics.init();
    analytics.identify('user-1', { name: 'Ada' });
    analytics.capture('Thing Happened');
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.identify).not.toHaveBeenCalled();
    expect(analytics.getContextHeaders()).toEqual({});
  });

  it('initialises posthog with the plan defaults and registers globals', () => {
    const analytics = createAnalyticsClient({
      app: 'tides',
      apiKey: 'phc_test',
      host: 'https://eu.i.posthog.com',
      environment: 'staging',
    });
    analytics.init();
    analytics.init();

    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(posthog.init).toHaveBeenCalledWith(
      'phc_test',
      expect.objectContaining({
        api_host: 'https://eu.i.posthog.com',
        defaults: '2026-05-30',
        person_profiles: 'identified_only',
        autocapture: true,
        capture_pageview: false,
        capture_pageleave: true,
        disable_session_recording: true,
        persistence: 'localStorage+cookie',
        cross_subdomain_cookie: true,
      }),
    );
    expect(posthog.register).toHaveBeenCalledWith({
      app: 'tides',
      environment: 'staging',
    });
  });

  it('forwards identity, groups, events and context headers', () => {
    const analytics = createAnalyticsClient({ app: 'kraken', apiKey: 'phc_test' });
    analytics.identify('user-1', { name: 'Ada' });
    analytics.group('workspace', 'ws-1', { name: 'Personal' });
    analytics.capture('Document Created', { document_type: 'note' });
    analytics.pageview();

    expect(posthog.identify).toHaveBeenCalledWith(
      'user-1',
      { name: 'Ada' },
      undefined,
    );
    expect(posthog.group).toHaveBeenCalledWith('workspace', 'ws-1', {
      name: 'Personal',
    });
    expect(posthog.capture).toHaveBeenCalledWith('Document Created', {
      document_type: 'note',
    });
    expect(posthog.capture).toHaveBeenCalledWith('$pageview');
    expect(analytics.getContextHeaders()).toEqual({
      'X-POSTHOG-DISTINCT-ID': 'distinct-123',
      'X-POSTHOG-SESSION-ID': 'session-456',
    });
  });

  it('emits at most one pageview per URL inside the guard window', () => {
    vi.useFakeTimers();
    try {
      const analytics = createAnalyticsClient({
        app: 'turtletime',
        apiKey: 'phc_test',
      });
      analytics.pageview();
      analytics.pageview();
      expect(posthog.capture).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(501);
      analytics.pageview();
      expect(posthog.capture).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('emits a lifecycle action once within the dedupe window', () => {
    vi.useFakeTimers();
    try {
      const analytics = createAnalyticsClient({
        app: 'shellstack',
        apiKey: 'phc_test',
      });
      analytics.capture('User Logged Out', { origin: 'api_client' });
      analytics.capture('User Logged Out', { origin: 'sidebar' });

      expect(posthog.capture).toHaveBeenCalledTimes(1);
      expect(posthog.capture).toHaveBeenCalledWith('User Logged Out', {
        origin: 'api_client',
        action_id: expect.any(String),
      });

      vi.advanceTimersByTime(501);
      analytics.capture('User Logged Out', { origin: 'sidebar' });
      expect(posthog.capture).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not dedupe repeatable app-owned actions and keeps explicit action ids', () => {
    const analytics = createAnalyticsClient({ app: 'tides', apiKey: 'phc_test' });
    analytics.capture('Task Created', { operation: 'create' });
    analytics.capture('Task Created', { operation: 'create' });
    analytics.capture('Theme Updated', { theme: 'dark' });
    analytics.capture('Theme Updated', { theme: 'light' });
    analytics.capture('Theme Updated', { theme: 'light', action_id: 'action-1' });

    expect(posthog.capture).toHaveBeenCalledTimes(5);
    expect(posthog.capture).toHaveBeenNthCalledWith(3, 'Theme Updated', {
      theme: 'dark',
      action_id: expect.any(String),
    });
    expect(posthog.capture).toHaveBeenNthCalledWith(5, 'Theme Updated', {
      theme: 'light',
      action_id: 'action-1',
    });
  });

  it('registers defined super-properties and clears null ones', () => {
    const analytics = createAnalyticsClient({ app: 'shelly', apiKey: 'phc_test' });
    analytics.registerSuperProperties({
      workspace_id: 'ws-1',
      organisation_id: null,
      user_role: undefined,
    });

    expect(posthog.register).toHaveBeenCalledWith({ workspace_id: 'ws-1' });
    expect(posthog.unregister).toHaveBeenCalledWith('organisation_id');
    expect(posthog.unregister).not.toHaveBeenCalledWith('user_role');
  });

  it('resets on sign-out', () => {
    const analytics = createAnalyticsClient({ app: 'shellstack', apiKey: 'phc_test' });
    analytics.reset();
    expect(posthog.reset).toHaveBeenCalledTimes(1);
  });
});

describe('emailDomain', () => {
  it('returns the lowercased domain without exposing the address', () => {
    expect(emailDomain('Person@Example.COM')).toBe('example.com');
    expect(emailDomain(null)).toBeUndefined();
    expect(emailDomain('not-an-email')).toBeUndefined();
  });
});
