/**
 * @module lib/services/opsService
 *
 * Operational intelligence service for the staff command center. Derives
 * prioritized alerts from live sector data, applies AI-recommended actions
 * to close the decision loop, and computes venue-wide KPIs for situational
 * awareness.
 */

import type { OpsAlert, StadiumSector, VenueKpi } from '@/types';
import {
  CROWD_ALERT_THRESHOLD,
  REDIRECT_TARGET,
  SUSTAINABILITY_IDLE_THRESHOLD,
  TRANSIT_OPTIONS
} from '@/lib/data/venue';

/** Density reduction (percentage points) applied to a redirected sector. */
const REDIRECT_DENSITY_REDUCTION = 22;

/** Minimum density floor after a redirect action (prevents unrealistic drops). */
const REDIRECT_DENSITY_FLOOR = 40;

/** Density increase (percentage points) applied to the redirect target sector. */
const REDIRECT_DENSITY_INCREASE = 12;

/** Maximum density cap for the redirect target (prevents overflow). */
const REDIRECT_DENSITY_CAP = 98;

/** HVAC reduction percentage communicated in alert messages. */
const HVAC_REDUCTION_PERCENT = 20;

/** Avg density threshold for 'critical' KPI tone. */
const KPI_DENSITY_CRITICAL = 80;

/** Avg density threshold for 'warn' KPI tone. */
const KPI_DENSITY_WARN = 65;

/** Sustainability score threshold for 'good' tone. */
const KPI_SUSTAINABILITY_GOOD = 33;

/**
 * Derives prioritized operational alerts from a live sector snapshot. Sectors
 * above the crowd threshold generate high-severity redirect alerts; sectors
 * below the idle threshold generate medium-severity sustainability alerts.
 *
 * @param sectors - Current live sector snapshot.
 * @returns Prioritized array of alerts (high-severity first).
 */
export function deriveAlerts(sectors: StadiumSector[]): OpsAlert[] {
  return sectors
    .filter((sector) => sector.density >= CROWD_ALERT_THRESHOLD || sector.density < SUSTAINABILITY_IDLE_THRESHOLD)
    .map((sector) => {
      if (sector.density >= CROWD_ALERT_THRESHOLD) {
        return {
          id: `crowd-${sector.id}`,
          sectorId: sector.id,
          sector: sector.name,
          severity: 'high',
          message: `${sector.name} is at ${sector.density}% density and still ${sector.trend}.`,
          aiAction: `Redirect fans toward ${REDIRECT_TARGET} and open overflow lanes.`,
          actionType: 'redirect'
        } satisfies OpsAlert;
      }

      return {
        id: `sustainability-${sector.id}`,
        sectorId: sector.id,
        sector: sector.name,
        severity: 'medium',
        message: `${sector.name} is under ${SUSTAINABILITY_IDLE_THRESHOLD}% occupancy.`,
        aiAction: `Reduce HVAC power by ${HVAC_REDUCTION_PERCENT}% and dim support corridor lighting.`,
        actionType: 'hvac'
      } satisfies OpsAlert;
    })
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'high' ? -1 : 1));
}

/**
 * Applies an AI-recommended action to the live sector state, closing the
 * decision loop. A redirect eases the flagged sector and fills the target
 * bowl; an HVAC cut marks the idle sector as reduced.
 *
 * @param sectors - Current sector state to transform.
 * @param alert - The alert whose recommended action should be applied.
 * @returns A new sector array with the action applied (immutable update).
 */
export function applyAlertAction(sectors: StadiumSector[], alert: OpsAlert): StadiumSector[] {
  if (alert.actionType === 'redirect') {
    return sectors.map((sector) => {
      if (sector.id === alert.sectorId) {
        return {
          ...sector,
          density: Math.max(REDIRECT_DENSITY_FLOOR, sector.density - REDIRECT_DENSITY_REDUCTION),
          trend: 'falling' as const
        };
      }

      if (sector.name === REDIRECT_TARGET) {
        return {
          ...sector,
          density: Math.min(REDIRECT_DENSITY_CAP, sector.density + REDIRECT_DENSITY_INCREASE),
          trend: 'rising' as const
        };
      }

      return sector;
    });
  }

  if (alert.actionType === 'hvac') {
    return sectors.map((sector) =>
      sector.id === alert.sectorId ? { ...sector, hvacStatus: 'reduced' as const } : sector
    );
  }

  return sectors;
}

/**
 * Synthesizes a short, human-readable situation report from the live snapshot.
 * Turns raw sector/alert data into the one-glance narrative a control-room lead
 * needs — busiest sector, crowd/HVAC actions outstanding, and greenest transit —
 * closing the gap between KPI numbers and an operational decision.
 *
 * Pure function of its inputs: same snapshot always yields the same report.
 *
 * @param sectors - Current live sector snapshot.
 * @param alerts - Derived alerts from the same snapshot.
 * @returns A 2–4 sentence situation summary.
 */
export function buildSituationReport(sectors: StadiumSector[], alerts: OpsAlert[]): string {
  if (sectors.length === 0) {
    return 'No sector telemetry available.';
  }

  const busiest = sectors.reduce((max, sector) => (sector.density > max.density ? sector : max));
  const crowdAlerts = alerts.filter((alert) => alert.actionType === 'redirect').length;
  const hvacAlerts = alerts.filter((alert) => alert.actionType === 'hvac').length;

  const headline =
    crowdAlerts > 0
      ? `${crowdAlerts} sector${crowdAlerts > 1 ? 's' : ''} above ${CROWD_ALERT_THRESHOLD}% — ${busiest.name} is hottest at ${busiest.density}% and ${busiest.trend}.`
      : `All sectors within safe density; ${busiest.name} leads at ${busiest.density}%.`;

  const sustainability =
    hvacAlerts > 0
      ? `${hvacAlerts} idle sector${hvacAlerts > 1 ? 's' : ''} eligible for HVAC reduction.`
      : 'No idle-sector energy savings pending.';

  const greenest = TRANSIT_OPTIONS.find((option) => option.greenest) ?? TRANSIT_OPTIONS[0];
  const egress = greenest ? ` Recommended egress: ${greenest.label} (greenest, ${greenest.etaMinutes} min).` : '';

  return `${headline} ${sustainability}${egress}`;
}

/**
 * Computes venue-wide KPIs for the staff command center dashboard. Synthesizes
 * attendance, average density, active alerts, and sustainability score from
 * the live sector snapshot and derived alerts.
 *
 * @param sectors - Current live sector snapshot.
 * @param alerts - Derived alerts from the same snapshot.
 * @returns Array of four KPIs for dashboard display.
 */
export function computeKpis(sectors: StadiumSector[], alerts: OpsAlert[]): VenueKpi[] {
  const totalCapacity = sectors.reduce((sum, sector) => sum + sector.capacity, 0);
  const occupied = sectors.reduce((sum, sector) => sum + Math.round((sector.density / 100) * sector.capacity), 0);
  const avgDensity = Math.round(sectors.reduce((sum, sector) => sum + sector.density, 0) / sectors.length);
  const highAlerts = alerts.filter((alert) => alert.severity === 'high').length;
  const reducedSectors = sectors.filter((sector) => sector.hvacStatus === 'reduced').length;
  const sustainabilityScore = Math.round((reducedSectors / sectors.length) * 100);

  return [
    {
      id: 'attendance',
      label: 'Live Attendance',
      value: occupied.toLocaleString('en-US'),
      hint: `${Math.round((occupied / totalCapacity) * 100)}% of ${totalCapacity.toLocaleString('en-US')} capacity`,
      tone: 'neutral'
    },
    {
      id: 'density',
      label: 'Avg Density',
      value: `${avgDensity}%`,
      hint: avgDensity >= 75 ? 'Elevated venue load' : 'Within safe range',
      tone: avgDensity >= KPI_DENSITY_CRITICAL ? 'critical' : avgDensity >= KPI_DENSITY_WARN ? 'warn' : 'good'
    },
    {
      id: 'alerts',
      label: 'Active Crowd Alerts',
      value: `${highAlerts}`,
      hint: highAlerts > 0 ? 'Needs mitigation' : 'All sectors nominal',
      tone: highAlerts > 0 ? 'critical' : 'good'
    },
    {
      id: 'sustainability',
      label: 'Sustainability Score',
      value: `${sustainabilityScore}%`,
      hint: `${reducedSectors} sectors on reduced HVAC`,
      tone: sustainabilityScore >= KPI_SUSTAINABILITY_GOOD ? 'good' : 'neutral'
    }
  ];
}
