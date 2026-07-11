import { applyAlertAction, buildSituationReport, computeKpis, deriveAlerts } from '@/lib/services/opsService';
import { CROWD_ALERT_THRESHOLD, REDIRECT_TARGET, SUSTAINABILITY_IDLE_THRESHOLD } from '@/lib/data/venue';
import type { StadiumSector } from '@/types';

const sample: StadiumSector[] = [
  {
    id: 'S2',
    name: 'East Concourse',
    zone: 'concourse',
    density: 90,
    capacity: 6400,
    hvacStatus: 'active',
    trend: 'rising'
  },
  {
    id: 'S3',
    name: REDIRECT_TARGET,
    zone: 'bowl',
    density: 15,
    capacity: 15600,
    hvacStatus: 'reduced',
    trend: 'steady'
  },
  {
    id: 'S4',
    name: 'West Transit Hub',
    zone: 'transit',
    density: 60,
    capacity: 5200,
    hvacStatus: 'active',
    trend: 'steady'
  }
];

describe('opsService.deriveAlerts', () => {
  it('flags high density as a high-severity redirect and low occupancy as medium hvac', () => {
    const alerts = deriveAlerts(sample);

    const high = alerts.find((alert) => alert.severity === 'high');
    const medium = alerts.find((alert) => alert.severity === 'medium');

    expect(high?.actionType).toBe('redirect');
    expect(high?.sectorId).toBe('S2');
    expect(medium?.actionType).toBe('hvac');
    expect(alerts[0]?.severity).toBe('high'); // high alerts sorted first
  });

  it('ignores sectors within safe operating bounds', () => {
    const alerts = deriveAlerts([sample[2]!]);
    expect(alerts).toHaveLength(0);
    expect(60).toBeGreaterThan(SUSTAINABILITY_IDLE_THRESHOLD);
    expect(60).toBeLessThan(CROWD_ALERT_THRESHOLD);
  });
});

describe('opsService.applyAlertAction', () => {
  it('eases the flagged sector and fills the redirect target', () => {
    const [alert] = deriveAlerts(sample);
    const next = applyAlertAction(sample, alert!);

    const east = next.find((sector) => sector.id === 'S2')!;
    const target = next.find((sector) => sector.name === REDIRECT_TARGET)!;

    expect(east.density).toBeLessThan(90);
    expect(east.trend).toBe('falling');
    expect(target.density).toBeGreaterThan(15);
  });

  it('marks an idle sector as reduced for an hvac action', () => {
    const hvacAlert = deriveAlerts(sample).find((alert) => alert.actionType === 'hvac')!;
    const next = applyAlertAction(
      sample.map((sector) => ({ ...sector, hvacStatus: 'active' as const })),
      hvacAlert
    );
    expect(next.find((sector) => sector.id === hvacAlert.sectorId)!.hvacStatus).toBe('reduced');
  });
});

describe('opsService.buildSituationReport', () => {
  it('names the hottest sector and surfaces outstanding crowd + transit guidance', () => {
    const alerts = deriveAlerts(sample);
    const report = buildSituationReport(sample, alerts);

    expect(report).toContain('East Concourse'); // busiest sector (90%)
    expect(report).toContain('NJ Transit Rail'); // greenest egress option
    expect(report).toMatch(/above 85%/);
  });

  it('reports safe status when no crowd alerts exist', () => {
    const calm = sample.map((sector) => ({ ...sector, density: 55 }));
    const report = buildSituationReport(calm, deriveAlerts(calm));
    expect(report).toContain('within safe density');
  });

  it('handles an empty snapshot without throwing', () => {
    expect(buildSituationReport([], [])).toBe('No sector telemetry available.');
  });
});

describe('opsService.computeKpis', () => {
  it('produces four KPIs with a critical alert count when high alerts exist', () => {
    const alerts = deriveAlerts(sample);
    const kpis = computeKpis(sample, alerts);

    expect(kpis).toHaveLength(4);
    expect(kpis.find((kpi) => kpi.id === 'alerts')?.tone).toBe('critical');
  });
});
