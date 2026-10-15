import { describe, expect, it } from 'vitest';
import { nextRevisionTick } from './use-suite-revisions';

const baseline = {
  documents: 1,
  calendar: 1,
  notifications: 1,
  tasks: 1,
  time: 1,
};

describe('suite revision polls', () => {
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
