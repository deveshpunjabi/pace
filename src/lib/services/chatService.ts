/**
 * @module lib/services/chatService
 *
 * Orchestrates grounded chat generation. The client only supplies free-text
 * intent; all operational facts are re-derived server-side, so the trust
 * boundary stays small and prompt injection has minimal leverage. This
 * service sits between the route handler and the AI provider.
 */

import type { AiProvider } from '@/lib/ai/types';
import { sanitizeUserText } from '@/lib/ai/sanitize';
import { KNOWLEDGE_BASE, VENUE_NAME } from '@/lib/data/venue';
import { generateLiveSignals } from '@/lib/simulation/liveSignals';
import type { ChatPayload } from '@/lib/validators/schemas';

/**
 * Derives a compact, server-truthful context string for grounding the model.
 * Combines the live sector snapshot with static venue facts so every AI
 * response is rooted in real data rather than hallucination.
 *
 * @param now - Epoch timestamp to derive the venue snapshot from.
 * @returns A formatted context string for the system prompt.
 */
export function buildLiveContext(now: number = Date.now()): string {
  const sectors = generateLiveSignals(now);
  const sectorLines = sectors
    .map(
      (sector) =>
        `- ${sector.name} (${sector.id}): ${sector.density}% density, HVAC ${sector.hvacStatus}, trend ${sector.trend}`
    )
    .join('\n');

  return `Venue: ${VENUE_NAME}\nSectors:\n${sectorLines}\nFacts:\n${KNOWLEDGE_BASE.map((fact) => `- ${fact}`).join('\n')}`;
}

/**
 * Streams a grounded chat answer from the configured AI provider. Sanitizes
 * user messages, filters system messages, and injects server-derived live
 * context so every response is anchored in the current venue state.
 *
 * @param provider - The resolved AI provider (mock or Vertex).
 * @param payload - Validated chat payload from the client.
 * @param now - Epoch timestamp for context derivation (injectable for testing).
 * @yields Token strings as they arrive from the AI provider.
 */
export async function* streamChatAnswer(
  provider: AiProvider,
  payload: ChatPayload,
  now: number = Date.now()
): AsyncIterable<string> {
  const context = buildLiveContext(now);
  const messages = payload.messages
    .filter((message) => message.role !== 'system')
    .map((message) => ({
      role: message.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: message.role === 'user' ? sanitizeUserText(message.content) : message.content
    }));

  yield* provider.streamChat({
    role: payload.userRole,
    language: payload.language,
    context,
    messages
  });
}
