/**
 * @jest-environment node
 */
import { GET } from '@/app/api/live-signals/route';

describe('GET /api/live-signals', () => {
  it('returns a venue snapshot containing sectors, alerts, kpis, and phase', async () => {
    const response = GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('no-store');

    const body = await response.json();

    // phase must be a recognized match phase string
    expect(['arrivals', 'kickoff', 'first-half', 'half-time', 'second-half', 'egress']).toContain(body.phase);

    // sectors is a non-empty array of sector objects
    expect(Array.isArray(body.sectors)).toBe(true);
    expect(body.sectors.length).toBeGreaterThan(0);
    for (const sector of body.sectors) {
      expect(sector).toHaveProperty('id');
      expect(sector).toHaveProperty('density');
      expect(typeof sector.density).toBe('number');
    }

    // alerts is an array (may be empty if no thresholds triggered)
    expect(Array.isArray(body.alerts)).toBe(true);

    // kpis is an array of KPI objects
    expect(Array.isArray(body.kpis)).toBe(true);
    expect(body.kpis.length).toBeGreaterThan(0);
    for (const kpi of body.kpis) {
      expect(kpi).toHaveProperty('id');
      expect(kpi).toHaveProperty('label');
      expect(kpi).toHaveProperty('value');
      expect(kpi).toHaveProperty('tone');
    }
  });
});
