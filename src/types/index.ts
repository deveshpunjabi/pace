/**
 * @module types
 *
 * Central type definitions shared across the PACE application. Every domain
 * concept (user roles, venue sectors, alerts, KPIs) is defined here so that
 * services, components, and routes import from a single source of truth.
 */

/** The two personas the application supports: mobile fans and control-room staff. */
export type UserRole = 'fan' | 'staff';

/** Supported concierge languages for the multilingual fan assistant. */
export type Language = 'en' | 'es' | 'fr';

/** Roles within a chat conversation thread. */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * A single message in a chat conversation. Immutable once created because
 * messages are append-only in the conversation log.
 */
export interface Message {
  readonly role: MessageRole;
  readonly content: string;
}

/** Physical zone classification of a stadium sector. */
export type SectorZone = 'gate' | 'concourse' | 'bowl' | 'transit' | 'services' | 'suite';

/** Direction of crowd density change over a 6-second window. */
export type DensityTrend = 'rising' | 'falling' | 'steady';

/** HVAC operating mode for energy management. */
export type HvacStatus = 'active' | 'reduced';

/**
 * A real-time snapshot of one stadium sector. This is the canonical type that
 * the simulation layer produces and every consumer (heatmap, alerts, KPIs)
 * depends on — so a real IoT feed can replace the simulation without touching
 * any downstream code.
 */
export interface StadiumSector {
  readonly id: string;
  readonly name: string;
  readonly zone: SectorZone;
  readonly density: number;
  readonly capacity: number;
  readonly hvacStatus: HvacStatus;
  readonly trend: DensityTrend;
}

/** Alert severity levels used for prioritized triage in the ops queue. */
export type AlertSeverity = 'medium' | 'high';

/** Type of mitigation action an alert recommends. */
export type AlertActionType = 'redirect' | 'hvac';

/**
 * An AI-derived operational alert with a recommended mitigation action.
 * Alerts are immutable once derived from a sector snapshot.
 */
export interface OpsAlert {
  readonly id: string;
  readonly sectorId: string;
  readonly sector: string;
  readonly severity: AlertSeverity;
  readonly message: string;
  readonly aiAction: string;
  readonly actionType: AlertActionType;
}

/** Visual tone for KPI display — drives color coding in the UI. */
export type KpiTone = 'neutral' | 'good' | 'warn' | 'critical';

/**
 * A venue-wide key performance indicator computed from the live sector
 * snapshot and current alert state.
 */
export interface VenueKpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly hint: string;
  readonly tone: KpiTone;
}
