import type { UserRole } from '@/types';

export interface Capability {
  id: string;
  area: string;
  personas: UserRole[];
  feature: string;
  surface: string;
}

/**
 * Every capability area named in the Challenge 4 brief, each mapped to a
 * concrete feature and the surface that implements it. Exposed via
 * /api/capabilities and asserted by tests so alignment is machine-verifiable.
 */
export const CAPABILITIES: Capability[] = [
  {
    id: 'navigation',
    area: 'Navigation',
    personas: ['fan'],
    feature: 'Step-by-step accessible wayfinding grounded in live venue context',
    surface: 'FanChat + /api/chat'
  },
  {
    id: 'crowd-management',
    area: 'Crowd management',
    personas: ['staff'],
    feature: 'Live per-sector density heatmap with 85% alert threshold',
    surface: 'OpsMap + opsService.deriveAlerts'
  },
  {
    id: 'accessibility',
    area: 'Accessibility',
    personas: ['fan', 'staff'],
    feature: 'Step-free routing (Gate C flagged non-accessible) and ARIA-first UI',
    surface: 'venue.SECTOR_PROFILES.stepFree + prompts'
  },
  {
    id: 'transportation',
    area: 'Transportation',
    personas: ['fan'],
    feature: 'Post-match transit guidance with fastest/greenest options',
    surface: 'venue.TRANSIT_OPTIONS + mock provider'
  },
  {
    id: 'sustainability',
    area: 'Sustainability',
    personas: ['staff'],
    feature: 'HVAC reduction for idle sectors and a venue sustainability score',
    surface: 'SustainabilityMeter + opsService.applyAlertAction'
  },
  {
    id: 'multilingual',
    area: 'Multilingual assistance',
    personas: ['fan'],
    feature: 'Native EN/ES/FR concierge with per-response language',
    surface: 'FanChat language tabs + prompts'
  },
  {
    id: 'operational-intelligence',
    area: 'Operational intelligence',
    personas: ['staff'],
    feature: 'Venue KPI bar synthesizing attendance, density, alerts, sustainability',
    surface: 'KpiBar + opsService.computeKpis'
  },
  {
    id: 'real-time-decision',
    area: 'Real-time decision support',
    personas: ['staff'],
    feature: 'Streamed AI mitigation plans and one-click executable actions',
    surface: 'StaffDashboard + opsService.applyAlertAction'
  }
];
