// AUTO-GENERATED from ERROR_CODES.md by scripts/error-codes/generate.py. Do not edit.

export const ERROR_CODES = {
  AUTH_001: 'E-AUTH-001',
  AUTH_002: 'E-AUTH-002',
  AUTH_003: 'E-AUTH-003',
  VALID_001: 'E-VALID-001',
  DATA_001: 'E-DATA-001',
  DATA_002: 'E-DATA-002',
  LIMIT_001: 'E-LIMIT-001',
  NET_001: 'E-NET-001',
  EXT_001: 'E-EXT-001',
  EXT_002: 'E-EXT-002',
  SYS_001: 'E-SYS-001',
  SYS_002: 'E-SYS-002',
  CLIENT_001: 'E-CLIENT-001',
  CLIENT_002: 'E-CLIENT-002',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const DEFAULT_ERROR_CODE: ErrorCode = 'E-SYS-001';

export const ERROR_COPY: Record<ErrorCode, string> = {
  'E-AUTH-001': 'Sign-in was not accepted. Check your details and try again.',
  'E-AUTH-002': 'Your session has ended. Sign in again to continue.',
  'E-AUTH-003': 'You do not have access to this. Ask an administrator for access.',
  'E-VALID-001': 'Some details need correcting before this can be saved.',
  'E-DATA-001': 'We could not find what you asked for. It may have been removed.',
  'E-DATA-002': 'This conflicts with existing information. Review it and try again.',
  'E-LIMIT-001': 'Too many requests right now. Wait a moment and try again.',
  'E-NET-001': 'We could not reach the service. Try again in a moment.',
  'E-EXT-001': 'The <capability> is unavailable right now. Try again shortly.',
  'E-EXT-002': 'The <capability> could not complete that request. Try again, or adjust the input.',
  'E-SYS-001': 'Something went wrong on our side. We have recorded it. Try again.',
  'E-SYS-002': 'This feature is temporarily unavailable while we carry out maintenance.',
  'E-CLIENT-001': 'You appear to be offline. Check your connection and try again.',
  'E-CLIENT-002': 'We could not read the response. Reload the page and try again.',
};

export const ERROR_RETRYABLE: Record<ErrorCode, boolean> = {
  'E-AUTH-001': false,
  'E-AUTH-002': true,
  'E-AUTH-003': false,
  'E-VALID-001': false,
  'E-DATA-001': false,
  'E-DATA-002': false,
  'E-LIMIT-001': true,
  'E-NET-001': true,
  'E-EXT-001': true,
  'E-EXT-002': true,
  'E-SYS-001': true,
  'E-SYS-002': false,
  'E-CLIENT-001': true,
  'E-CLIENT-002': true,
};

const ERROR_CODE_SET = new Set<string>(Object.values(ERROR_CODES));

export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && ERROR_CODE_SET.has(value);
}

export function copyFor(code: ErrorCode, capability?: string): string {
  const copy = ERROR_COPY[code] ?? ERROR_COPY[DEFAULT_ERROR_CODE];
  if (copy.includes('<capability>')) {
    return copy.replace('<capability>', capability ?? 'service');
  }
  return copy;
}
