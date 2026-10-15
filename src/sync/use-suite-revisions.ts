import { useEffect, useRef } from 'react';

export interface SuiteRevisionMap {
  documents: number;
  calendar: number;
  notifications: number;
  tasks: number;
  time: number;
  catalogue: number;
}

/**
 * First successful poll is the baseline and refreshes nothing. Later polls
 * report only topics whose integer moved, so unchanged lists are not refetched.
 */
export function nextRevisionTick(
  seen: Record<string, number>,
  ready: boolean,
  data: Partial<SuiteRevisionMap> | null,
): { seen: Record<string, number>; ready: boolean; changed: string[] } {
  if (!data) return { seen, ready, changed: [] };
  const next = { ...seen };
  if (!ready) {
    for (const [topic, value] of Object.entries(data)) {
      if (typeof value === 'number') next[topic] = value;
    }
    return { seen: next, ready: true, changed: [] };
  }
  const changed: string[] = [];
  for (const [topic, value] of Object.entries(data)) {
    if (typeof value !== 'number' || next[topic] === value) continue;
    next[topic] = value;
    changed.push(topic);
  }
  return { seen: next, ready: true, changed };
}

/**
 * Poll workspace revisions and report topics whose integer moved.
 * The first successful read is the baseline, so a reload does not refetch
 * everything the snapshot already painted.
 */
export function useSuiteRevisions(options: {
  enabled: boolean;
  /** Workspace (or other) id. Changing it refetches, so the previous workspace cannot stay on screen. */
  scope?: string;
  load: () => Promise<Partial<SuiteRevisionMap> | null>;
  onTopic: (topic: string) => void;
  pollMs?: number;
}): void {
  const loadRef = useRef(options.load);
  const onTopicRef = useRef(options.onTopic);
  loadRef.current = options.load;
  onTopicRef.current = options.onTopic;
  const pollMs = options.pollMs ?? 15_000;
  const scope = options.scope ?? '';
  const seenScope = useRef<string | null>(null);

  useEffect(() => {
    if (!options.enabled || typeof window === 'undefined') return;
    const switching = seenScope.current !== null && seenScope.current !== scope;
    seenScope.current = scope;
    let seen: Record<string, number> = {};
    // A workspace change is not a cold load: every topic for the new scope is stale.
    let ready = switching;
    let timer: number | undefined;

    const tick = async () => {
      let data: Partial<SuiteRevisionMap> | null = null;
      try {
        data = await loadRef.current();
      } catch {
        return;
      }
      const step = nextRevisionTick(seen, ready, data);
      seen = step.seen;
      ready = step.ready;
      for (const topic of step.changed) onTopicRef.current(topic);
    };

    const stop = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      if (timer !== undefined) return;
      void tick();
      timer = window.setInterval(() => void tick(), pollMs);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') start();
      else stop();
    };
    if (document.visibilityState === 'visible') start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [options.enabled, pollMs, scope]);
}
