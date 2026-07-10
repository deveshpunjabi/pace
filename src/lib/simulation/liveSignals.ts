import type { DensityTrend, StadiumSector } from '@/types';
import { SECTOR_PROFILES, SUSTAINABILITY_IDLE_THRESHOLD, type SectorProfile } from '@/lib/data/venue';

export type MatchPhase = 'arrivals' | 'kickoff' | 'first-half' | 'half-time' | 'second-half' | 'egress';

/** Length of one demo matchday loop, in milliseconds (compressed for the demo). */
export const CYCLE_MS = 120_000;

const PHASES: { phase: MatchPhase; until: number; pressure: number }[] = [
  { phase: 'arrivals', until: 0.2, pressure: 0.65 },
  { phase: 'kickoff', until: 0.35, pressure: 1.0 },
  { phase: 'first-half', until: 0.55, pressure: 0.5 },
  { phase: 'half-time', until: 0.7, pressure: 0.95 },
  { phase: 'second-half', until: 0.9, pressure: 0.55 },
  { phase: 'egress', until: 1.01, pressure: 0.9 }
];

export function phaseAt(epochMs: number): MatchPhase {
  const progress = (epochMs % CYCLE_MS) / CYCLE_MS;
  return PHASES.find((entry) => progress < entry.until)?.phase ?? 'egress';
}

function pressureAt(epochMs: number): number {
  const progress = (epochMs % CYCLE_MS) / CYCLE_MS;
  return PHASES.find((entry) => progress < entry.until)?.pressure ?? 0.9;
}

/** Deterministic smooth noise in [-1, 1] from a seed and time bucket. */
function noise(seed: string, bucket: number): number {
  let hash = 0;
  const key = `${seed}:${bucket}`;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(index);
    hash |= 0;
  }

  return (Math.sin(hash) + 1) / 2 - 0.5;
}

function densityFor(profile: SectorProfile, epochMs: number): number {
  const pressure = pressureAt(epochMs);
  const bucket = Math.floor(epochMs / 6000);
  const swing = noise(profile.id, bucket) * profile.volatility * 22;
  const phaseLift = (pressure - 0.5) * profile.volatility * 40;
  const raw = profile.baseline + phaseLift + swing;

  return Math.min(98, Math.max(5, Math.round(raw)));
}

function trendFor(profile: SectorProfile, epochMs: number): DensityTrend {
  const current = densityFor(profile, epochMs);
  const previous = densityFor(profile, epochMs - 6000);

  if (current > previous + 1) {
    return 'rising';
  }

  if (current < previous - 1) {
    return 'falling';
  }

  return 'steady';
}

/**
 * Pure function of time: given the same timestamp it always returns the same
 * venue snapshot. A real turnstile/IoT feed can replace this without touching
 * any consumer, because everything depends only on the StadiumSector type.
 */
export function generateLiveSignals(epochMs: number = Date.now()): StadiumSector[] {
  return SECTOR_PROFILES.map((profile) => {
    const density = densityFor(profile, epochMs);

    return {
      id: profile.id,
      name: profile.name,
      zone: profile.zone,
      density,
      capacity: profile.capacity,
      hvacStatus: density < SUSTAINABILITY_IDLE_THRESHOLD ? 'reduced' : 'active',
      trend: trendFor(profile, epochMs)
    };
  });
}
