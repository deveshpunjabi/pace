export type AiProviderName = 'mock' | 'vertex';

export interface AppEnv {
  aiProvider: AiProviderName;
  gcpProjectId: string | undefined;
  gcpLocation: string;
  geminiModel: string;
}

function readProvider(value: string | undefined): AiProviderName {
  return value === 'vertex' ? 'vertex' : 'mock';
}

/** Centralized, validated environment access. Never exposes secrets to the client. */
export const env: AppEnv = {
  aiProvider: readProvider(process.env.PACE_AI_PROVIDER),
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpLocation: process.env.GCP_LOCATION ?? 'us-central1',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'
};
