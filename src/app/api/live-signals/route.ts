import { NextResponse } from 'next/server';
import { deriveAlerts, computeKpis } from '@/lib/services/opsService';
import { generateLiveSignals, phaseAt } from '@/lib/simulation/liveSignals';

export const runtime = 'nodejs';

/** Read-only live venue snapshot. No user input, so no validation surface. */
export function GET(): Response {
  const now = Date.now();
  const sectors = generateLiveSignals(now);
  const alerts = deriveAlerts(sectors);

  return NextResponse.json(
    { phase: phaseAt(now), sectors, alerts, kpis: computeKpis(sectors, alerts) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
