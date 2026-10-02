export const WEBHOOK_ACTIVITY_ACTIONS = [
  { id: 'created', label: 'Task created' },
  { id: 'updated', label: 'Task updated' },
  { id: 'status_changed', label: 'Task status changed' },
  { id: 'assigned', label: 'Task assigned' },
  { id: 'commented', label: 'Comment posted' },
  { id: 'project_renamed', label: 'Project renamed' },
  { id: 'project_status_changed', label: 'Project archived or restored' },
] as const;

const ALL_WEBHOOK_ACTION_IDS = WEBHOOK_ACTIVITY_ACTIONS.map(
  (action) => action.id,
);

export function webhookActionsToSelected(
  stored: string[] | null | undefined,
): Set<string> {
  if (!stored || stored.length === 0) {
    return new Set(ALL_WEBHOOK_ACTION_IDS);
  }
  return new Set(stored);
}

export function selectedToWebhookActions(selected: Set<string>): string[] {
  if (selected.size >= ALL_WEBHOOK_ACTION_IDS.length) {
    return [];
  }
  return ALL_WEBHOOK_ACTION_IDS.filter((id) => selected.has(id));
}
