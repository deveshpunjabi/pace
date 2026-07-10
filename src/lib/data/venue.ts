/**
 * @module lib/data/venue
 *
 * Static venue reference data for the demo scenario at MetLife Stadium.
 * Contains sector profiles, transit options, and a knowledge base of
 * grounding facts. This data is the single source of truth that the AI
 * concierge, ops heatmap, and alert engine all reason about.
 */

import type { SectorZone } from '@/types';

/** Official name of the demo venue. */
export const VENUE_NAME = 'MetLife Stadium';

/** City and state of the demo venue. */
export const VENUE_CITY = 'East Rutherford, New Jersey';

/** Tournament context for prompt grounding. */
export const TOURNAMENT = 'FIFA World Cup 2026';

/** Target sector name for crowd redirect actions. */
export const REDIRECT_TARGET = 'South Lower Bowl';

/** Density percentage at or above which a sector triggers a crowd alert. */
export const CROWD_ALERT_THRESHOLD = 85;

/** Density percentage below which a sector is considered idle (sustainability). */
export const SUSTAINABILITY_IDLE_THRESHOLD = 30;

/**
 * Static profile of a stadium sector used by the simulation engine.
 * Describes physical attributes and simulation parameters.
 */
export interface SectorProfile {
  readonly id: string;
  readonly name: string;
  readonly zone: SectorZone;
  readonly capacity: number;
  /** Baseline occupancy the sector settles toward, 0-100. */
  readonly baseline: number;
  /** How strongly matchday phases move this sector, 0-1. */
  readonly volatility: number;
  /** Whether a step-free / wheelchair accessible path is available. */
  readonly stepFree: boolean;
}

/**
 * Static sector definitions for the demo venue. Gate C (East Concourse) is the
 * coherent scenario fact: it runs hot AND lacks a step-free path, so the fan
 * concierge, the ops heatmap, and the alert engine all reason about it.
 */
export const SECTOR_PROFILES: readonly SectorProfile[] = [
  { id: 'S1', name: 'North Gate Plaza', zone: 'gate', capacity: 8200, baseline: 48, volatility: 0.8, stepFree: true },
  {
    id: 'S2',
    name: 'East Concourse',
    zone: 'concourse',
    capacity: 6400,
    baseline: 82,
    volatility: 0.9,
    stepFree: false
  },
  { id: 'S3', name: 'South Lower Bowl', zone: 'bowl', capacity: 15600, baseline: 20, volatility: 0.5, stepFree: true },
  {
    id: 'S4',
    name: 'West Transit Hub',
    zone: 'transit',
    capacity: 5200,
    baseline: 58,
    volatility: 0.85,
    stepFree: true
  },
  {
    id: 'S5',
    name: 'Family Services Corridor',
    zone: 'services',
    capacity: 3100,
    baseline: 66,
    volatility: 0.6,
    stepFree: true
  },
  { id: 'S6', name: 'Upper Suite Ring', zone: 'suite', capacity: 2400, baseline: 18, volatility: 0.4, stepFree: true }
];

/**
 * A post-match transit option with estimated time and carbon footprint.
 * Used by the fan concierge to recommend the fastest/greenest travel choice.
 */
export interface TransitOption {
  readonly id: string;
  readonly label: string;
  readonly etaMinutes: number;
  readonly carbonKgPerRider: number;
  readonly greenest: boolean;
}

/**
 * Available post-match transit options ranked by ETA. The greenest option
 * (NJ Transit Rail) is flagged for sustainability-aware recommendations.
 */
export const TRANSIT_OPTIONS: readonly TransitOption[] = [
  { id: 'rail', label: 'NJ Transit Rail', etaMinutes: 18, carbonKgPerRider: 0.4, greenest: true },
  { id: 'shuttle', label: 'Match Shuttle', etaMinutes: 24, carbonKgPerRider: 1.1, greenest: false },
  { id: 'rideshare', label: 'Rideshare (Lot C)', etaMinutes: 32, carbonKgPerRider: 3.6, greenest: false }
];

/**
 * Grounding facts the concierge may reference. Keeps AI answers anchored in
 * verified venue information rather than hallucination.
 */
export const KNOWLEDGE_BASE: readonly string[] = [
  'Accessible Lift A serves Level 2 near North Gate Plaza (Gate N2).',
  'East Concourse (Gate C) has no step-free path; wheelchair users should use Gate N2 and Accessible Lift A.',
  'Prohibited items include large bags over 30cm, glass, and professional cameras.',
  'The greenest post-match travel option is NJ Transit Rail from the West Transit Hub.',
  'Family Services Corridor has sensory-friendly rooms and first aid.'
];
