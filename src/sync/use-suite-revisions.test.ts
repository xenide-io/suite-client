import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { nextRevisionTick, useSuiteRevisions } from './use-suite-revisions';

const baseline = {
  documents: 1,
  calendar: 1,
  notifications: 1,
  tasks: 1,
  time: 1,
};

describe('suite revision polls', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does not overlap slow polls or notify a new workspace with an old response', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    const container = document.createElement('div');
    const root = createRoot(container);
    let resolve!: (data: typeof baseline) => void;
    const load = vi.fn(
      () =>
        new Promise<typeof baseline>((done) => {
          resolve = done;
        }),
    );
    const onTopic = vi.fn();
    function Poller({ scope }: { scope: string }) {
      useSuiteRevisions({ enabled: true, scope, load, onTopic, pollMs: 100 });
      return null;
    }
    try {
      await act(async () => root.render(createElement(Poller, { scope: 'a' })));
      const resolveA = resolve;
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });
      expect(load).toHaveBeenCalledTimes(1);
      await act(async () => root.render(createElement(Poller, { scope: 'b' })));
      expect(load).toHaveBeenCalledTimes(2);
      await act(async () => resolveA(baseline));
      expect(onTopic).not.toHaveBeenCalled();
      await act(async () => resolve(baseline));
      expect(onTopic.mock.calls.map(([topic]) => topic).sort()).toEqual(
        Object.keys(baseline).sort(),
      );
    } finally {
      await act(async () => root.unmount());
    }
  });

  it('uses the first reading as a baseline and does not refetch', () => {
    const step = nextRevisionTick({}, false, baseline);
    expect(step.ready).toBe(true);
    expect(step.changed).toEqual([]);
    expect(step.seen).toEqual(baseline);
  });

  it('refetches only the topic that changed', () => {
    const started = nextRevisionTick({}, false, baseline);
    const documents = nextRevisionTick(started.seen, started.ready, {
      ...baseline,
      documents: 2,
    });
    expect(documents.changed).toEqual(['documents']);

    const quiet = nextRevisionTick(documents.seen, documents.ready, {
      ...baseline,
      documents: 2,
    });
    expect(quiet.changed).toEqual([]);
  });

  it('reports every topic when a workspace switch starts from an empty baseline', () => {
    const step = nextRevisionTick({}, true, baseline);
    expect(step.changed.sort()).toEqual(Object.keys(baseline).sort());
  });

  it('ignores a failed poll and keeps the previous baseline', () => {
    const started = nextRevisionTick({}, false, baseline);
    const failed = nextRevisionTick(started.seen, started.ready, null);
    expect(failed.changed).toEqual([]);
    expect(failed.seen).toEqual(baseline);
    expect(failed.ready).toBe(true);
  });
});
