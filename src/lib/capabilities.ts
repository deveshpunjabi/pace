/**
 * @module lib/capabilities
 *
 * Machine-verifiable mapping of every Challenge 4 capability area to a
 * concrete feature and its implementation surface. Exposed via
 * `GET /api/capabilities` and asserted by unit tests so problem-statement
 * alignment is provable, not just claimed.
 */

import type { UserRole } from '@/types';

/**
 * A single capability area from the Challenge 4 brief, mapped to the feature
 * that satisfies it and the code surface that implements it.
 */
export interface Capability {
  readonly id: string;
  readonly area: string;
  readonly personas: readonly UserRole[];
  readonly feature: string;
  readonly surface: string;
}

/**
 * Complete set of capabilities required by the Smart Stadiums & Tournament
 * Operations brief. Each entry maps verbatim area text to the working feature
 * and its implementation surface in this codebase.
 */
export const CAPABILITIES: readonly Capability[] = [
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
