/**
 * @module lib/ai/provider
 *
 * Factory that resolves the active AI provider at runtime. The app defaults to
 * the deterministic mock so it runs with zero secrets; the real Vertex provider
 * activates only when explicitly configured via environment variables.
 */

import type { AiProvider } from '@/lib/ai/types';
import { MockAiProvider } from '@/lib/ai/mockProvider';
import { VertexAiProvider } from '@/lib/ai/vertexProvider';
import { env } from '@/lib/env';

/**
 * Resolves the active AI provider based on environment configuration.
 *
 * Falls back to the deterministic mock provider unless `PACE_AI_PROVIDER=vertex`
 * AND a GCP project ID are both configured, ensuring the app is always runnable
 * with zero secrets during development, testing, and demos.
 */
export function resolveAiProvider(): AiProvider {
  if (env.aiProvider === 'vertex' && env.gcpProjectId) {
    return new VertexAiProvider({
      projectId: env.gcpProjectId,
      location: env.gcpLocation,
      model: env.geminiModel
    });
  }

  return new MockAiProvider();
}
