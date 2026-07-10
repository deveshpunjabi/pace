import { rateLimit } from '@/lib/security/rateLimit';

export const MAX_BODY_BYTES = 8_192;

export interface GuardFailure {
  ok: false;
  status: 400 | 413 | 415 | 429;
  code: 'invalid_content_type' | 'payload_too_large' | 'rate_limited';
  message: string;
}

export interface GuardSuccess {
  ok: true;
  clientId: string;
}

export type GuardResult = GuardFailure | GuardSuccess;

function clientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
}

/**
 * One place to audit request safety for every AI-cost-incurring route:
 * JSON content-type (415), bounded body (413), and per-client rate limit (429).
 */
export function enforceRequestGuards(request: Request, rawBody: string): GuardResult {
  const contentType = request.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return { ok: false, status: 415, code: 'invalid_content_type', message: 'Expected application/json.' };
  }

  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return { ok: false, status: 413, code: 'payload_too_large', message: 'Request body is too large.' };
  }

  const id = clientId(request);
  const limit = rateLimit(id);

  if (!limit.allowed) {
    return { ok: false, status: 429, code: 'rate_limited', message: 'Too many requests. Try again shortly.' };
  }

  return { ok: true, clientId: id };
}
