import { useCallback, useEffect, useState } from 'react';

import type { Api } from '../api/create-api-client';

const EMAIL_PREFERENCE_PATH = '/api/notifications/email/';

export interface EmailNotificationPreference {
  enabled: boolean;
  busy: boolean;
  error: string;
  onChange: (enabled: boolean) => void;
}

/**
 * Loads and saves the signed-in person's email notification preference.
 * The preference is shared across suite apps.
 */
export function useEmailNotificationPreference(
  api: Api,
  parseApiError: (res: Response) => Promise<string>,
): EmailNotificationPreference {
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get(EMAIL_PREFERENCE_PATH)
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { enabled?: boolean };
        if (!cancelled) setEnabled(Boolean(data.enabled));
      })
      .catch(() => {
        // The settings card stays off until a later save succeeds.
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  const onChange = useCallback(
    (next: boolean) => {
      setBusy(true);
      setError('');
      setEnabled(next);
      api
        .patch(EMAIL_PREFERENCE_PATH, { enabled: next })
        .then(async (res) => {
          if (!res.ok) {
            setEnabled(!next);
            setError(await parseApiError(res));
          }
        })
        .catch((err: unknown) => {
          setEnabled(!next);
          setError(
            err instanceof Error
              ? err.message
              : 'Could not save email notifications.',
          );
        })
        .finally(() => setBusy(false));
    },
    [api, parseApiError],
  );

  return { enabled, busy, error, onChange };
}
