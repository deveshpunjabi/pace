import type { OpsAlert, StadiumSector } from '@/types';

export const CROWD_ALERT_THRESHOLD = 85;
export const SUSTAINABILITY_IDLE_THRESHOLD = 30;

export function initializeSectors(): StadiumSector[] {
  return [
    { id: 'S1', name: 'North Gate Plaza', density: 45, hvacStatus: 'active' },
    { id: 'S2', name: 'East Concourse', density: 88, hvacStatus: 'active' },
    { id: 'S3', name: 'South Lower Bowl', density: 15, hvacStatus: 'reduced' },
    { id: 'S4', name: 'West Transit Hub', density: 60, hvacStatus: 'active' },
    { id: 'S5', name: 'Family Services Corridor', density: 72, hvacStatus: 'active' },
    { id: 'S6', name: 'Upper Suite Ring', density: 10, hvacStatus: 'reduced' }
  ];
}

export function fluctuateDensity(sectors: StadiumSector[]): StadiumSector[] {
  return sectors.map((sector) => {
    const change = Math.floor(Math.random() * 10) - 5;
    const density = Math.min(98, Math.max(5, sector.density + change));
    const hvacStatus = density < SUSTAINABILITY_IDLE_THRESHOLD ? 'reduced' : 'active';

    return { ...sector, density, hvacStatus };
  });
}

export function buildOpsAlerts(sectors: StadiumSector[]): OpsAlert[] {
  return sectors
    .filter((sector) => sector.density >= CROWD_ALERT_THRESHOLD || sector.density < SUSTAINABILITY_IDLE_THRESHOLD)
    .map((sector) => {
      if (sector.density >= CROWD_ALERT_THRESHOLD) {
        return {
          id: `crowd-${sector.id}`,
          sector: sector.name,
          severity: 'high',
          message: `${sector.name} is at ${sector.density}% density.`,
          aiAction: 'Dispatch redirect alert and open overflow lanes toward South Lower Bowl.'
        } satisfies OpsAlert;
      }

      return {
        id: `sustainability-${sector.id}`,
        sector: sector.name,
        severity: 'medium',
        message: `${sector.name} is under ${SUSTAINABILITY_IDLE_THRESHOLD}% occupancy.`,
        aiAction: 'Reduce HVAC power by 20% and dim support corridor lighting.'
      } satisfies OpsAlert;
    });
}
