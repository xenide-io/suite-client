import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from './codes';
import {
  appErrorFromResponse,
  formatAppError,
  normalizeError,
} from './normalize';

describe('normalizeError', () => {
  it('resolves a known envelope code', () => {
    const error = normalizeError({
      error: { code: ERROR_CODES.AUTH_003, correlation_id: 'abc' },
    });
    expect(error.code).toBe(ERROR_CODES.AUTH_003);
    expect(error.correlationId).toBe('abc');
  });

  it('falls back for an unknown code', () => {
    const error = normalizeError({ error: { code: 'E-NOPE-999' } });
    expect(error.code).toBe(ERROR_CODES.SYS_001);
  });

  it('ignores raw upstream text', () => {
    const error = normalizeError({ detail: 'Traceback leaked here' });
    expect(error.message).not.toContain('Traceback');
  });
});

describe('formatAppError', () => {
  it('appends the reference code', () => {
    const error = normalizeError({ error: { code: ERROR_CODES.DATA_001 } });
    expect(formatAppError(error)).toContain(`(Reference: ${error.code})`);
  });
});

describe('appErrorFromResponse', () => {
  it('maps HTTP status when no envelope is present', async () => {
    const response = new Response('nope', { status: 404 });
    const error = await appErrorFromResponse(response);
    expect(error.code).toBe(ERROR_CODES.DATA_001);
  });
});
