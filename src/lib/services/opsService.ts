import type { OpsAlert, StadiumSector, VenueKpi } from '@/types';
import { CROWD_ALERT_THRESHOLD, REDIRECT_TARGET, SUSTAINABILITY_IDLE_THRESHOLD } from '@/lib/data/venue';

/** Derives prioritized operational alerts from a live sector snapshot. */
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
        aiAction: 'Reduce HVAC power by 20% and dim support corridor lighting.',
        actionType: 'hvac'
      } satisfies OpsAlert;
    })
    .sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'high' ? -1 : 1));
}

/**
 * Applies an AI-recommended action to the live sector state, closing the
 * decision loop: a redirect eases the flagged sector and fills the target
 * bowl; an HVAC cut marks the idle sector as reduced.
 */
export function applyAlertAction(sectors: StadiumSector[], alert: OpsAlert): StadiumSector[] {
  if (alert.actionType === 'redirect') {
    return sectors.map((sector) => {
      if (sector.id === alert.sectorId) {
        return { ...sector, density: Math.max(40, sector.density - 22), trend: 'falling' as const };
      }

      if (sector.name === REDIRECT_TARGET) {
        return { ...sector, density: Math.min(98, sector.density + 12), trend: 'rising' as const };
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

/** Computes venue-wide KPIs for the staff command center. */
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
      tone: avgDensity >= 80 ? 'critical' : avgDensity >= 65 ? 'warn' : 'good'
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
      tone: sustainabilityScore >= 33 ? 'good' : 'neutral'
    }
  ];
}
