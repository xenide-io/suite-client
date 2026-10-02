export type SuiteAiJobEvent = {
  sequence: number;
  event_type:
    | 'queued'
    | 'started'
    | 'progress'
    | 'tool'
    | 'completed'
    | 'failed'
    | 'cancelled';
  summary: string;
  payload: Record<string, unknown>;
  created_at: string;
};

export type SuiteAiJob = {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  events: SuiteAiJobEvent[];
};

export function activeSuiteAiJobs(jobs: SuiteAiJob[]) {
  return jobs.filter(
    (job) => job.status === 'pending' || job.status === 'running',
  );
}

export function sortedSuiteAiEvents(events: SuiteAiJobEvent[]) {
  return [...events].sort((a, b) => a.sequence - b.sequence);
}

export function suiteAiEventSummary(event?: SuiteAiJobEvent) {
  const summary = event?.summary
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (summary) return summary;
  if (event?.event_type === 'queued') return 'Shelly request queued';
  if (event?.event_type === 'started')
    return 'Shelly started preparing a reply';
  if (event?.event_type === 'completed') return 'Shelly reply ready';
  if (event?.event_type === 'failed') return 'AI request failed';
  return 'Shelly is working';
}
