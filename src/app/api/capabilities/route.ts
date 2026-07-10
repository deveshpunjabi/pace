import { NextResponse } from 'next/server';
import { CAPABILITIES } from '@/lib/capabilities';

export const runtime = 'nodejs';

/** Machine-verifiable problem-statement alignment map. */
export function GET(): Response {
  return NextResponse.json({ total: CAPABILITIES.length, capabilities: CAPABILITIES });
}
