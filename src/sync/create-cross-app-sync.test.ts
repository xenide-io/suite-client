import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Api } from '../api/create-api-client';
import { createCrossAppSync } from './create-cross-app-sync';

describe('cross-app checkpoint polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('primes without refreshing, coalesces changed topics and ignores unchanged polls', async () => {
    let data = {
      tasks_synced_at: 100,
      time_synced_at: 200,
      integration_synced_at: 300,
    };
    const get = vi.fn(async () => Response.json(data));
    const sync = createCrossAppSync({
      api: { get } as unknown as Api,
      checkpointPath: '/checkpoint',
      pollMs: 100,
    });
    const all = vi.fn();
    const tasks = vi.fn();
    const stop = sync.subscribeCrossAppSync(all);
    const stopTasks = sync.subscribeCrossAppSync(tasks, 'tasks');
    await vi.advanceTimersByTimeAsync(0);
    expect(all).not.toHaveBeenCalled();
    data = {
      tasks_synced_at: 101,
      time_synced_at: 201,
      integration_synced_at: 301,
    };
    await vi.advanceTimersByTimeAsync(100);
    expect(all).toHaveBeenCalledTimes(1);
    expect(tasks).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(100);
    expect(all).toHaveBeenCalledTimes(1);
    stop();
    stopTasks();
    await vi.advanceTimersByTimeAsync(100);
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('does not overlap slow requests or apply a previous workspace response', async () => {
    let workspace = 'a';
    let resolve!: (response: Response) => void;
    const get = vi.fn(
      () =>
        new Promise<Response>((done) => {
          resolve = done;
        }),
    );
    const sync = createCrossAppSync({
      api: { get } as unknown as Api,
      checkpointPath: '/checkpoint',
      pollMs: 100,
      getScope: () => workspace,
    });
    const refresh = vi.fn();
    const stop = sync.subscribeCrossAppSync(refresh);
    await vi.advanceTimersByTimeAsync(300);
    expect(get).toHaveBeenCalledTimes(1);
    workspace = 'b';
    resolve(Response.json({ tasks_synced_at: 99 }));
    await vi.advanceTimersByTimeAsync(0);
    expect(sync.lastCrossAppSyncTime()).toBe(0);
    await vi.advanceTimersByTimeAsync(100);
    expect(get).toHaveBeenCalledTimes(2);
    resolve(Response.json({ tasks_synced_at: 10 }));
    await vi.advanceTimersByTimeAsync(0);
    expect(sync.lastCrossAppSyncTime('tasks')).toBe(10);
    expect(refresh).not.toHaveBeenCalled();
    stop();
  });

  it('does not repoll when components resubscribe, but does poll a new workspace', async () => {
    let workspace = 'a';
    const get = vi.fn(async () => Response.json({ tasks_synced_at: 100 }));
    const sync = createCrossAppSync({
      api: { get } as unknown as Api,
      checkpointPath: '/checkpoint',
      pollMs: 100,
      getScope: () => workspace,
    });
    let stop = sync.subscribeCrossAppSync(vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    stop();
    stop = sync.subscribeCrossAppSync(vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(get).toHaveBeenCalledTimes(1);
    stop();
    workspace = 'b';
    stop = sync.subscribeCrossAppSync(vi.fn());
    await vi.advanceTimersByTimeAsync(0);
    expect(get).toHaveBeenCalledTimes(2);
    stop();
  });
});
