import {
  DEFAULT_ERROR_CODE,
  ERROR_CODES,
  ERROR_RETRYABLE,
  copyFor,
  isErrorCode,
  type ErrorCode,
} from './codes';

/**
 * The single normalised shape every caught failure is reduced to before any
 * component sees it. `message` is always resolved from the local registry;
 * upstream text is never carried through.
 */
export type AppError = {
  code: ErrorCode;
  message: string;
  correlationId?: string;
  retryable: boolean;
};

const STATUS_TO_CODE: Record<number, ErrorCode> = {
  400: ERROR_CODES.VALID_001,
  401: ERROR_CODES.AUTH_001,
  403: ERROR_CODES.AUTH_003,
  404: ERROR_CODES.DATA_001,
  405: ERROR_CODES.SYS_001,
  409: ERROR_CODES.DATA_002,
  422: ERROR_CODES.VALID_001,
  429: ERROR_CODES.LIMIT_001,
  500: ERROR_CODES.SYS_001,
  502: ERROR_CODES.EXT_002,
  503: ERROR_CODES.NET_001,
};

export function codeForStatus(status: number): ErrorCode {
  if (STATUS_TO_CODE[status]) return STATUS_TO_CODE[status];
  if (status >= 500) return ERROR_CODES.SYS_001;
  if (status >= 400) return ERROR_CODES.VALID_001;
  return ERROR_CODES.SYS_001;
}

function build(
  code: ErrorCode,
  correlationId?: string,
  retryable?: boolean,
  capability?: string,
): AppError {
  return {
    code,
    message: copyFor(code, capability),
    ...(correlationId ? { correlationId } : {}),
    retryable: retryable ?? ERROR_RETRYABLE[code],
  };
}

function extractEnvelope(
  input: unknown,
): { code: string; correlationId?: string; retryable?: boolean } | null {
  if (typeof input !== 'object' || input === null) return null;
  const error = (input as Record<string, unknown>).error;
  if (typeof error !== 'object' || error === null) return null;
  const record = error as Record<string, unknown>;
  return {
    code: typeof record.code === 'string' ? record.code : '',
    correlationId:
      typeof record.correlation_id === 'string'
        ? record.correlation_id
        : undefined,
    retryable:
      typeof record.retryable === 'boolean' ? record.retryable : undefined,
  };
}

/**
 * Reduce an unknown value to an `AppError`. Accepts only the envelope shape;
 * every other key on the input is discarded. Unknown or absent codes fall back.
 */
export function normalizeError(
  input: unknown,
  fallback: ErrorCode = DEFAULT_ERROR_CODE,
  capability?: string,
): AppError {
  const envelope = extractEnvelope(input);
  if (!envelope) return build(fallback, undefined, undefined, capability);
  const resolved = isErrorCode(envelope.code) ? envelope.code : fallback;
  return build(
    resolved,
    envelope.correlationId,
    envelope.retryable,
    capability,
  );
}

/** Normalise a non-2xx `Response` without ever reading its raw message. */
export async function appErrorFromResponse(
  response: Response,
  capability?: string,
): Promise<AppError> {
  const fallback = codeForStatus(response.status);
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = undefined;
  }
  return normalizeError(body, fallback, capability);
}

/** Normalise a thrown fetch failure: offline, aborted, or unreachable. */
export function normalizeThrown(input: unknown, capability?: string): AppError {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return build(ERROR_CODES.CLIENT_001, undefined, undefined, capability);
  }
  if (input instanceof DOMException && input.name === 'AbortError') {
    return build(ERROR_CODES.NET_001, undefined, undefined, capability);
  }
  return build(ERROR_CODES.NET_001, undefined, undefined, capability);
}

/** Display string for a failure surface: capability copy plus the code. */
export function formatAppError(error: AppError): string {
  return `${error.message} (Reference: ${error.code})`;
}
