import { CAPABILITIES } from '@/lib/capabilities';

describe('capabilities alignment map', () => {
  it('covers all eight problem-statement areas', () => {
    const areas = CAPABILITIES.map((capability) => capability.area.toLowerCase());

    for (const required of [
      'navigation',
      'crowd management',
      'accessibility',
      'transportation',
      'sustainability',
      'multilingual assistance',
      'operational intelligence',
      'real-time decision support'
    ]) {
      expect(areas).toContain(required);
    }

    expect(CAPABILITIES).toHaveLength(8);
  });

  it('maps every capability to at least one persona and a surface', () => {
    for (const capability of CAPABILITIES) {
      expect(capability.personas.length).toBeGreaterThan(0);
      expect(capability.surface.length).toBeGreaterThan(0);
    }
  });
});
