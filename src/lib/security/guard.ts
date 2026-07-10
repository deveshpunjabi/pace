/**
 * @module lib/security/guard
 *
 * Centralized request guard for AI-cost-incurring routes. One place to audit
 * request safety: validates JSON content-type (415), enforces body size cap
 * (413), and applies per-client rate limiting (429). Every guarded route
 * calls `enforceRequestGuards` before any business logic runs.
 */

import { rateLimit } from '@/lib/security/rateLimit';

/** Maximum allowed request body size in bytes to prevent abuse. */
export const MAX_BODY_BYTES = 8_192;

/**
 * Describes a request that failed one of the security guards.
 * Contains the HTTP status, machine-readable code, and human-readable message.
 */
export interface GuardFailure {
  readonly ok: false;
  readonly status: 400 | 413 | 415 | 429;
  readonly code: 'invalid_content_type' | 'payload_too_large' | 'rate_limited';
  readonly message: string;
}

/**
 * Describes a request that passed all security guards.
 * Includes the resolved client identifier for downstream logging.
 */
export interface GuardSuccess {
  readonly ok: true;
  readonly clientId: string;
}

/** Discriminated union result of running all request guards. */
export type GuardResult = GuardFailure | GuardSuccess;

/**
 * Extracts a stable client identifier from proxy headers or falls back to
 * 'anonymous'. Used as the rate-limiter key.
 *
 * @param request - Incoming HTTP request.
 * @returns A string identifying the requesting client.
 */
function clientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
}

/**
 * Enforces all request safety guards in sequence: content-type validation,
 * body size cap, and per-client rate limiting. Must be called before any
 * AI-cost-incurring logic so abuse is rejected cheaply.
 *
 * @param request - Incoming HTTP request.
 * @param rawBody - The raw request body string (already read from the stream).
 * @returns A discriminated union indicating success or the specific failure.
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
