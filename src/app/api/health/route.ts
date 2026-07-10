/**
 * @module app/api/health/route
 *
 * Liveness probe endpoint. Returns the service status and active AI provider
 * mode so monitoring and CI can verify the application is running and which
 * AI backend is active.
 */

import { NextResponse } from 'next/server';
import { resolveAiProvider } from '@/lib/ai/provider';

export const runtime = 'nodejs';

/**
 * Returns a JSON health check response with current status, AI mode, and timestamp.
 *
 * @returns JSON response with `status`, `aiMode`, and `time` fields.
 */
export function GET(): Response {
  return NextResponse.json({ status: 'ok', aiMode: resolveAiProvider().mode, time: new Date().toISOString() });
}
