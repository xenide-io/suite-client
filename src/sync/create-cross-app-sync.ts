import type { Api } from '../api/create-api-client';

export type CrossAppSyncTopic = 'time' | 'integration' | 'tasks';

export interface CrossAppSyncConfig {
  api: Api;
  /** Checkpoint endpoint, e.g. `/api/turtletime/sync-checkpoint/`. */
  checkpointPath: string;
  /** Poll interval while the tab is visible (ms). */
  pollMs?: number;
  /** Reset the checkpoint baseline when the active workspace changes. */
  getScope?: () => string | null;
}

type SyncCheckpoint = {
  tasks_synced_at: number;
  time_synced_at: number;
  integration_synced_at: number;
};

export type CrossAppSync = ReturnType<typeof createCrossAppSync>;

/**
 * Poll backend checkpoints so sibling apps refresh when data mutates
 * elsewhere. Same-tab instant updates stay the app's responsibility via its
 * own window events.
 */
export function createCrossAppSync(config: CrossAppSyncConfig) {
  const pollMs = config.pollMs ?? 5000;

  const lastKnown: Record<CrossAppSyncTopic, number> = {
    time: 0,
    integration: 0,
    tasks: 0,
  };

  const subscribers: Array<{
    topic?: CrossAppSyncTopic;
    callback: () => void;
  }> = [];

  let pollInterval: number | null = null;
  let pollListeners = 0;
  let inFlight = false;
  let primed = false;
  let scope: string | null | undefined;
  let lastRequestedScope: string | null | undefined;
  let lastRequestedAt: number | undefined;

  async function fetchCheckpoint(): Promise<SyncCheckpoint | null> {
    if (inFlight || document.visibilityState !== 'visible') return null;
    const requestScope = config.getScope?.();
    if (
      requestScope === lastRequestedScope &&
      lastRequestedAt !== undefined &&
      Date.now() - lastRequestedAt < pollMs
    )
      return null;
    inFlight = true;
    lastRequestedScope = requestScope;
    lastRequestedAt = Date.now();
    try {
      const res = await config.api.get(config.checkpointPath);
      if (!res.ok) return null;
      const data = (await res.json()) as SyncCheckpoint;
      if (requestScope !== config.getScope?.()) return null;
      if (scope !== requestScope) {
        primed = false;
        scope = requestScope;
      }
      return data;
    } catch {
      return null;
    } finally {
      inFlight = false;
    }
  }

  function checkAndNotify(data: SyncCheckpoint): void {
    const next: Record<CrossAppSyncTopic, number> = {
      tasks: data.tasks_synced_at || 0,
      time: data.time_synced_at || 0,
      integration: data.integration_synced_at || 0,
    };
    const changed = (['tasks', 'time', 'integration'] as const).filter(
      (topic) => primed && next[topic] > lastKnown[topic],
    );
    Object.assign(lastKnown, next);
    primed = true;
    // One callback per subscriber, even when several topics moved together.
    for (const sub of subscribers) {
      if (changed.some((topic) => !sub.topic || sub.topic === topic))
        sub.callback();
    }
  }

  function startPolling(): void {
    if (pollInterval !== null || typeof window === 'undefined') return;

    void fetchCheckpoint().then((data) => data && checkAndNotify(data));
    pollInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void fetchCheckpoint().then((data) => data && checkAndNotify(data));
      }
    }, pollMs);
  }

  function stopPolling(): void {
    if (pollListeners > 0) return;
    if (pollInterval !== null) {
      window.clearInterval(pollInterval);
      pollInterval = null;
    }
  }

  function broadcastCrossAppSync(_topic: CrossAppSyncTopic): void {
    // Cross-subdomain sync is handled by backend checkpoints + polling.
    // Same-tab instant updates are dispatched via the app's own events.
    void _topic;
  }

  function subscribeCrossAppSync(
    onSync: () => void,
    topic?: CrossAppSyncTopic,
  ): () => void {
    if (typeof window === 'undefined') return () => {};

    const sub = {
      topic,
      callback: onSync,
    };
    subscribers.push(sub);
    pollListeners += 1;
    startPolling();

    return () => {
      const index = subscribers.indexOf(sub);
      if (index >= 0) subscribers.splice(index, 1);
      pollListeners -= 1;
      if (pollListeners <= 0) stopPolling();
    };
  }

  function lastCrossAppSyncTime(topic?: CrossAppSyncTopic): number {
    return topic ? lastKnown[topic] : Math.max(...Object.values(lastKnown));
  }

  return {
    broadcastCrossAppSync,
    subscribeCrossAppSync,
    lastCrossAppSyncTime,
  };
}
