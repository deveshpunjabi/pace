/**
 * @module lib/env
 *
 * Centralized, validated environment access. Reads process environment
 * variables once at module load and exposes them as a typed, readonly object.
 * Never exposes secrets to the client — all values stay server-side.
 */

/** Supported AI provider backend identifiers. */
export type AiProviderName = 'mock' | 'vertex';

/**
 * Validated application environment configuration. All properties are readonly
 * because environment values must not be mutated at runtime.
 */
export interface AppEnv {
  readonly aiProvider: AiProviderName;
  readonly gcpProjectId: string | undefined;
  readonly gcpLocation: string;
  readonly geminiModel: string;
}

/**
 * Parses the PACE_AI_PROVIDER env var into a type-safe provider name.
 * Defaults to 'mock' for any unrecognised or missing value.
 *
 * @param value - Raw environment variable value (may be undefined).
 * @returns A validated provider name.
 */
function readProvider(value: string | undefined): AiProviderName {
  return value === 'vertex' ? 'vertex' : 'mock';
}

/**
 * Singleton environment configuration. Validated at import time so downstream
 * code can trust the types without re-parsing.
 */
export const env: AppEnv = {
  aiProvider: readProvider(process.env.PACE_AI_PROVIDER),
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcpLocation: process.env.GCP_LOCATION ?? 'us-central1',
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'
};
