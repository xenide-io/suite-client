import type { Api } from '../api/create-api-client';

export type CrossAppSyncTopic = 'time' | 'integration' | 'tasks';

export interface CrossAppSyncConfig {
  api: Api;
  /** Checkpoint endpoint, e.g. `/api/turtletime/sync-checkpoint/`. */
  checkpointPath: string;
  /** Poll interval while the tab is visible (ms). */
  pollMs?: number;
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
    lastSync: number;
  }> = [];

  let pollInterval: number | null = null;
  let pollListeners = 0;

  async function fetchCheckpoint(): Promise<SyncCheckpoint | null> {
    try {
      const res = await config.api.get(config.checkpointPath);
      if (!res.ok) return null;
      return (await res.json()) as SyncCheckpoint;
    } catch {
      return null;
    }
  }

  function notify(topic: CrossAppSyncTopic): void {
    for (const sub of subscribers) {
      if (!sub.topic || sub.topic === topic) {
        if (lastKnown[topic] > sub.lastSync) {
          sub.lastSync = lastKnown[topic];
          sub.callback();
        }
      }
    }
  }

  function checkAndNotify(data: SyncCheckpoint): void {
    const tasks = data.tasks_synced_at || 0;
    const time = data.time_synced_at || 0;
    const integration = data.integration_synced_at || 0;

    if (tasks > lastKnown.tasks) {
      lastKnown.tasks = tasks;
      notify('tasks');
    }
    if (time > lastKnown.time) {
      lastKnown.time = time;
      notify('time');
    }
    if (integration > lastKnown.integration) {
      lastKnown.integration = integration;
      notify('integration');
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
      lastSync: lastKnown[topic || 'tasks'],
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
