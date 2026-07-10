export type UserRole = 'fan' | 'staff';
export type Language = 'en' | 'es' | 'fr';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

export type SectorZone = 'gate' | 'concourse' | 'bowl' | 'transit' | 'services' | 'suite';
export type DensityTrend = 'rising' | 'falling' | 'steady';
export type HvacStatus = 'active' | 'reduced';

export interface StadiumSector {
  id: string;
  name: string;
  zone: SectorZone;
  density: number;
  capacity: number;
  hvacStatus: HvacStatus;
  trend: DensityTrend;
}

export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertActionType = 'redirect' | 'hvac' | 'monitor';

export interface OpsAlert {
  id: string;
  sectorId: string;
  sector: string;
  severity: AlertSeverity;
  message: string;
  aiAction: string;
  actionType: AlertActionType;
}

export type KpiTone = 'neutral' | 'good' | 'warn' | 'critical';

export interface VenueKpi {
  id: string;
  label: string;
  value: string;
  hint: string;
  tone: KpiTone;
}
