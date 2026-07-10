import { NextResponse } from 'next/server';
import { resolveAiProvider } from '@/lib/ai/provider';

export const runtime = 'nodejs';

/** Liveness probe plus the currently active AI provider mode. */
export function GET(): Response {
  return NextResponse.json({ status: 'ok', aiMode: resolveAiProvider().mode, time: new Date().toISOString() });
}
