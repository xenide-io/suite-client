import type {
  CrossAppSync,
  CrossAppSyncTopic,
} from './create-cross-app-sync';

export interface LiveRefreshOptions {
  /** Same-tab custom events (e.g. `tt-timer-mutated`). */
  localEvents?: string[];
  /** Gentle poll while the tab is visible (ms). */
  pollMs?: number;
  /** Limit cross-tab refreshes to one mutation topic. */
  crossAppTopic?: CrossAppSyncTopic;
}

export type LiveRefresh = ReturnType<typeof createLiveRefresh>;

export function createLiveRefresh(sync: CrossAppSync) {
  /** True if a cross-tab sync for the given topic happened after `since`. */
  function hasPendingCrossAppSync(
    topic: CrossAppSyncTopic | undefined,
    since: number,
  ): boolean {
    return sync.lastCrossAppSyncTime(topic) > since;
  }

  /** Re-run `refresh` when sibling apps mutate data, on same-tab events, or on an interval. */
  function subscribeLiveRefresh(
    refresh: () => void,
    options: LiveRefreshOptions = {},
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const cleanups: Array<() => void> = [];
    let lastRefreshAt = Date.now();

    const trigger = () => {
      lastRefreshAt = Date.now();
      refresh();
    };

    for (const eventName of options.localEvents ?? []) {
      window.addEventListener(eventName, trigger);
      cleanups.push(() => window.removeEventListener(eventName, trigger));
    }

    cleanups.push(sync.subscribeCrossAppSync(trigger, options.crossAppTopic));

    const shouldRefreshOnFocus = () =>
      hasPendingCrossAppSync(options.crossAppTopic, lastRefreshAt);

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && shouldRefreshOnFocus()) {
        trigger();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    cleanups.push(() =>
      document.removeEventListener('visibilitychange', onVisibility),
    );

    const onFocus = () => {
      if (shouldRefreshOnFocus()) {
        trigger();
      }
    };
    window.addEventListener('focus', onFocus);
    cleanups.push(() => window.removeEventListener('focus', onFocus));

    if (options.pollMs && options.pollMs > 0) {
      const interval = window.setInterval(() => {
        if (document.visibilityState === 'visible') trigger();
      }, options.pollMs);
      cleanups.push(() => window.clearInterval(interval));
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }

  return { subscribeLiveRefresh, hasPendingCrossAppSync };
}
