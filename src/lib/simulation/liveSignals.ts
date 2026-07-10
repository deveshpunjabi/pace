/**
 * @module lib/simulation/liveSignals
 *
 * Deterministic venue simulation that produces a live sector snapshot as a
 * pure function of time. Given the same timestamp it always returns the same
 * result, enabling reproducible tests and demos. A real IoT/turnstile feed
 * can replace this module without touching any consumer because everything
 * depends only on the `StadiumSector` type.
 */

import type { DensityTrend, StadiumSector } from '@/types';
import { SECTOR_PROFILES, SUSTAINABILITY_IDLE_THRESHOLD, type SectorProfile } from '@/lib/data/venue';

/** Possible matchday phase labels that drive crowd pressure curves. */
export type MatchPhase = 'arrivals' | 'kickoff' | 'first-half' | 'half-time' | 'second-half' | 'egress';

/** Length of one demo matchday loop in milliseconds (compressed for the demo). */
export const CYCLE_MS = 120_000;

/** Signal polling interval in milliseconds — how often the frontend refreshes. */
const SIGNAL_INTERVAL_MS = 6_000;

/** Noise volatility scaling factor for per-sector density swings. */
const NOISE_VOLATILITY_SCALE = 22;

/** Phase pressure scaling factor for crowd lift. */
const PHASE_PRESSURE_SCALE = 40;

/** Minimum possible density percentage. */
const DENSITY_FLOOR = 5;

/** Maximum possible density percentage. */
const DENSITY_CEILING = 98;

/** Minimum density change to classify trend as 'rising' or 'falling'. */
const TREND_THRESHOLD = 1;

/**
 * Matchday phase schedule. Each entry defines the phase label, the progress
 * fraction at which it ends, and the crowd pressure multiplier it applies.
 */
const PHASES: readonly { readonly phase: MatchPhase; readonly until: number; readonly pressure: number }[] = [
  { phase: 'arrivals', until: 0.2, pressure: 0.65 },
  { phase: 'kickoff', until: 0.35, pressure: 1.0 },
  { phase: 'first-half', until: 0.55, pressure: 0.5 },
  { phase: 'half-time', until: 0.7, pressure: 0.95 },
  { phase: 'second-half', until: 0.9, pressure: 0.55 },
  { phase: 'egress', until: 1.01, pressure: 0.9 }
];

/**
 * Determines the current match phase from a timestamp by mapping progress
 * through the cycle to the phase schedule.
 *
 * @param epochMs - Epoch timestamp in milliseconds.
 * @returns The current match phase label.
 */
export function phaseAt(epochMs: number): MatchPhase {
  const progress = (epochMs % CYCLE_MS) / CYCLE_MS;
  return PHASES.find((entry) => progress < entry.until)?.phase ?? 'egress';
}

/**
 * Returns the crowd pressure multiplier for the current point in the
 * matchday cycle.
 *
 * @param epochMs - Epoch timestamp in milliseconds.
 * @returns Pressure value between 0 and 1.
 */
function pressureAt(epochMs: number): number {
  const progress = (epochMs % CYCLE_MS) / CYCLE_MS;
  return PHASES.find((entry) => progress < entry.until)?.pressure ?? 0.9;
}

/**
 * Deterministic smooth noise in [-0.5, 0.5] from a seed string and time
 * bucket. Uses a simple string hash passed through sin() to produce
 * reproducible pseudo-random values.
 *
 * @param seed - Sector identifier used as the random seed.
 * @param bucket - Time bucket number for temporal variation.
 * @returns A noise value between -0.5 and 0.5.
 */
function noise(seed: string, bucket: number): number {
  let hash = 0;
  const key = `${seed}:${bucket}`;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash << 5) - hash + key.charCodeAt(index);
    hash |= 0;
  }

  return (Math.sin(hash) + 1) / 2 - 0.5;
}

/**
 * Computes the density percentage for a sector at a given timestamp.
 * Combines baseline, phase pressure, and deterministic noise.
 *
 * @param profile - Static sector profile with baseline and volatility.
 * @param epochMs - Epoch timestamp in milliseconds.
 * @returns Clamped density percentage (5–98).
 */
function densityFor(profile: SectorProfile, epochMs: number): number {
  const pressure = pressureAt(epochMs);
  const bucket = Math.floor(epochMs / SIGNAL_INTERVAL_MS);
  const swing = noise(profile.id, bucket) * profile.volatility * NOISE_VOLATILITY_SCALE;
  const phaseLift = (pressure - 0.5) * profile.volatility * PHASE_PRESSURE_SCALE;
  const raw = profile.baseline + phaseLift + swing;

  return Math.min(DENSITY_CEILING, Math.max(DENSITY_FLOOR, Math.round(raw)));
}

/**
 * Determines the density trend for a sector by comparing current vs previous
 * density values.
 *
 * @param profile - Static sector profile.
 * @param epochMs - Current epoch timestamp in milliseconds.
 * @returns The trend direction: 'rising', 'falling', or 'steady'.
 */
function trendFor(profile: SectorProfile, epochMs: number): DensityTrend {
  const current = densityFor(profile, epochMs);
  const previous = densityFor(profile, epochMs - SIGNAL_INTERVAL_MS);

  if (current > previous + TREND_THRESHOLD) {
    return 'rising';
  }

  if (current < previous - TREND_THRESHOLD) {
    return 'falling';
  }

  return 'steady';
}

/**
 * Pure function of time: given the same timestamp it always returns the same
 * venue snapshot. Produces a `StadiumSector` array suitable for heatmaps,
 * alert derivation, and KPI computation.
 *
 * @param epochMs - Epoch timestamp in milliseconds (defaults to current time).
 * @returns Array of stadium sector snapshots.
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
