import type { SectorZone } from '@/types';

export const VENUE_NAME = 'MetLife Stadium';
export const VENUE_CITY = 'East Rutherford, New Jersey';
export const TOURNAMENT = 'FIFA World Cup 2026';
export const REDIRECT_TARGET = 'South Lower Bowl';
export const CROWD_ALERT_THRESHOLD = 85;
export const SUSTAINABILITY_IDLE_THRESHOLD = 30;

export interface SectorProfile {
  id: string;
  name: string;
  zone: SectorZone;
  capacity: number;
  /** Baseline occupancy the sector settles toward, 0-100. */
  baseline: number;
  /** How strongly matchday phases move this sector, 0-1. */
  volatility: number;
  /** Step-free / wheelchair accessible path available. */
  stepFree: boolean;
}

/**
 * Static sector definitions for the demo venue. Gate C (East Concourse) is the
 * coherent scenario fact: it runs hot AND lacks a step-free path, so the fan
 * concierge, the ops heatmap, and the alert engine all reason about it.
 */
export const SECTOR_PROFILES: SectorProfile[] = [
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

export interface TransitOption {
  id: string;
  label: string;
  etaMinutes: number;
  carbonKgPerRider: number;
  greenest: boolean;
}

export const TRANSIT_OPTIONS: TransitOption[] = [
  { id: 'rail', label: 'NJ Transit Rail', etaMinutes: 18, carbonKgPerRider: 0.4, greenest: true },
  { id: 'shuttle', label: 'Match Shuttle', etaMinutes: 24, carbonKgPerRider: 1.1, greenest: false },
  { id: 'rideshare', label: 'Rideshare (Lot C)', etaMinutes: 32, carbonKgPerRider: 3.6, greenest: false }
];

/** Grounding facts the concierge may reference; keeps answers non-hallucinated. */
export const KNOWLEDGE_BASE: string[] = [
  'Accessible Lift A serves Level 2 near North Gate Plaza (Gate N2).',
  'East Concourse (Gate C) has no step-free path; wheelchair users should use Gate N2 and Accessible Lift A.',
  'Prohibited items include large bags over 30cm, glass, and professional cameras.',
  'The greenest post-match travel option is NJ Transit Rail from the West Transit Hub.',
  'Family Services Corridor has sensory-friendly rooms and first aid.'
];
