import type { AiProvider } from '@/lib/ai/types';
import { sanitizeUserText } from '@/lib/ai/sanitize';
import { KNOWLEDGE_BASE, VENUE_NAME } from '@/lib/data/venue';
import { generateLiveSignals } from '@/lib/simulation/liveSignals';
import type { ChatPayload } from '@/lib/validators/schemas';

/** Derives a compact, server-truthful context string for grounding the model. */
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
 * Streams a grounded chat answer. The client only supplies free-text intent;
 * all operational facts are re-derived server-side, so the trust boundary
 * stays small and prompt injection has minimal leverage.
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
