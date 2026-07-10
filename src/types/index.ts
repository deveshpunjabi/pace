export type UserRole = 'fan' | 'staff';
export type Language = 'en' | 'es' | 'fr';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  role: MessageRole;
  content: string;
}

export interface StadiumSector {
  id: string;
  name: string;
  density: number;
  hvacStatus: 'active' | 'reduced';
}

export interface OpsAlert {
  id: string;
  sector: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
  aiAction: string;
}
