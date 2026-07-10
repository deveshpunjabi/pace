import type { AiProvider } from '@/lib/ai/types';
import { MockAiProvider } from '@/lib/ai/mockProvider';
import { VertexAiProvider } from '@/lib/ai/vertexProvider';
import { env } from '@/lib/env';

/**
 * Resolves the active AI provider. Falls back to the deterministic mock
 * provider unless Vertex is explicitly enabled AND a project id is configured,
 * so the app is always runnable with zero secrets.
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
