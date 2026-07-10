/**
 * @module app/api/live-signals/route
 *
 * Read-only live venue snapshot endpoint. Returns the current sector state,
 * derived alerts, and computed KPIs. Has no user input surface so it requires
 * no validation guards — safe to poll at the 6-second UI refresh interval.
 */

import { NextResponse } from 'next/server';
import { deriveAlerts, computeKpis } from '@/lib/services/opsService';
import { generateLiveSignals, phaseAt } from '@/lib/simulation/liveSignals';

export const runtime = 'nodejs';

/**
 * Returns the current venue snapshot including match phase, sector states,
 * derived alerts, and KPI values.
 *
 * @returns JSON response with `phase`, `sectors`, `alerts`, and `kpis`.
 */
export function GET(): Response {
  const now = Date.now();
  const sectors = generateLiveSignals(now);
  const alerts = deriveAlerts(sectors);

  return NextResponse.json(
    { phase: phaseAt(now), sectors, alerts, kpis: computeKpis(sectors, alerts) },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
