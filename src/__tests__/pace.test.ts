import { generateSystemPrompt } from '@/lib/ai/prompts';
import { paceTools } from '@/lib/ai/tools';
import { buildOpsAlerts, CROWD_ALERT_THRESHOLD, initializeSectors, SUSTAINABILITY_IDLE_THRESHOLD } from '@/lib/data/mockData';

describe('PACE AI alignment', () => {
  it('generates prompts with multilingual, crowd, and sustainability directives', () => {
    const prompt = generateSystemPrompt('staff', 'es');

    expect(prompt).toContain('MULTILINGUAL');
    expect(prompt).toContain('CROWD MANAGEMENT');
    expect(prompt).toContain('SUSTAINABILITY');
    expect(prompt).toContain('Spanish');
  });

  it('declares function tools for HVAC reduction and crowd redirection', () => {
    const declarations = paceTools[0].functionDeclarations.map((tool) => tool.name);

    expect(declarations).toContain('reduce_hvac_power');
    expect(declarations).toContain('dispatch_redirect_alert');
  });

  it('creates alerts for high crowd density and low occupancy sustainability', () => {
    const sectors = initializeSectors();
    const alerts = buildOpsAlerts(sectors);

    const highDensity = sectors.filter((sector) => sector.density >= CROWD_ALERT_THRESHOLD);
    const lowOccupancy = sectors.filter((sector) => sector.density < SUSTAINABILITY_IDLE_THRESHOLD);

    expect(highDensity.length).toBeGreaterThan(0);
    expect(lowOccupancy.length).toBeGreaterThan(0);
    expect(alerts.filter((alert) => alert.severity === 'high')).toHaveLength(highDensity.length);
    expect(alerts.filter((alert) => alert.severity === 'medium')).toHaveLength(lowOccupancy.length);
  });
});
