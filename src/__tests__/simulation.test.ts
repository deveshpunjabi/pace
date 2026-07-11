import { CYCLE_MS, generateLiveSignals, phaseAt, transitStatusAt } from '@/lib/simulation/liveSignals';
import { SECTOR_PROFILES, TRANSIT_OPTIONS } from '@/lib/data/venue';

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
      // HVAC must start 'active': reduction is a staff decision (executed via
      // an HVAC alert), never an automatic property of low occupancy. This
      // guards the sustainability decision loop against becoming a no-op.
      expect(sector.hvacStatus).toBe('active');
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

describe('simulation.transitStatusAt', () => {
  it('returns every transit option and preserves the greenest flag', () => {
    const status = transitStatusAt(0);
    expect(status).toHaveLength(TRANSIT_OPTIONS.length);
    expect(status.some((option) => option.greenest)).toBe(true);
  });

  it('surges wait times and load during post-match egress', () => {
    const arrivals = transitStatusAt(0); // progress 0 -> arrivals phase
    const egress = transitStatusAt(115_000); // progress ~0.96 -> egress phase

    const railArrivals = arrivals.find((option) => option.id === 'rail')!;
    const railEgress = egress.find((option) => option.id === 'rail')!;

    expect(railArrivals.load).toBe('light');
    expect(railEgress.load).toBe('heavy');
    expect(railEgress.etaMinutes).toBeGreaterThan(railArrivals.etaMinutes);
  });
});
