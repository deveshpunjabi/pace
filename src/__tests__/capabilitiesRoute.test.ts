/**
 * @jest-environment node
 */
import { GET } from '@/app/api/capabilities/route';

describe('GET /api/capabilities', () => {
  it('returns all 8 problem-statement areas with personas and surface fields for each capability', async () => {
    const response = GET();
    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body.total).toBe(8);
    expect(body.capabilities).toHaveLength(8);

    const expectedAreas = [
      'Navigation',
      'Crowd management',
      'Accessibility',
      'Transportation',
      'Sustainability',
      'Multilingual assistance',
      'Operational intelligence',
      'Real-time decision support'
    ];

    const returnedAreas = body.capabilities.map((c: { area: string }) => c.area);

    for (const area of expectedAreas) {
      expect(returnedAreas).toContain(area);
    }

    for (const capability of body.capabilities) {
      expect(capability).toHaveProperty('personas');
      expect(capability).toHaveProperty('surface');
      expect(Array.isArray(capability.personas)).toBe(true);
      expect(capability.personas.length).toBeGreaterThan(0);
      expect(typeof capability.surface).toBe('string');
      expect(capability.surface.length).toBeGreaterThan(0);
    }
  });
});
