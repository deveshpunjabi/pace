import { CYCLE_MS, generateLiveSignals, phaseAt } from '@/lib/simulation/liveSignals';
import { SECTOR_PROFILES } from '@/lib/data/venue';

describe('simulation.generateLiveSignals', () => {
  it('is deterministic: same timestamp yields identical output', () => {
    const now = 1_700_000_000_000;
    expect(generateLiveSignals(now)).toEqual(generateLiveSignals(now));
  });

  it('returns one entry per sector profile with density within 5-98', () => {
    const sectors = generateLiveSignals(1_700_000_000_000);
    expect(sectors).toHaveLength(SECTOR_PROFILES.length);

    for (const sector of sectors) {
      expect(sector.density).toBeGreaterThanOrEqual(5);
      expect(sector.density).toBeLessThanOrEqual(98);
      expect(['active', 'reduced']).toContain(sector.hvacStatus);
    }
  });

  it('walks through every matchday phase across a full cycle', () => {
    const phases = new Set<string>();

    for (let step = 0; step < 12; step += 1) {
      phases.add(phaseAt((step / 12) * CYCLE_MS));
    }

    expect(phases.has('arrivals')).toBe(true);
    expect(phases.has('egress')).toBe(true);
    expect(phases.size).toBeGreaterThanOrEqual(4);
  });
});
