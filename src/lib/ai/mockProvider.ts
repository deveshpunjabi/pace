/**
 * @module lib/ai/mockProvider
 *
 * Deterministic, offline AI provider that requires zero secrets and incurs
 * zero cost. Returns grounded but pre-composed answers for every scenario the
 * demo exercises, enabling full-stack testing and live demos without any
 * external API dependency.
 */

import type { AiChatRequest, AiProvider } from '@/lib/ai/types';
import { REDIRECT_TARGET } from '@/lib/data/venue';

/** Simulated token-streaming delay in milliseconds between emitted tokens. */
const TOKEN_DELAY_MS = 8;

/**
 * Composes a deterministic answer based on the request role, language, and
 * latest user message content. Covers navigation, transit, amenities, and
 * staff operations — the four core demo paths.
 *
 * @param request - The incoming chat request with role, language, and messages.
 * @returns A pre-composed grounded answer string.
 */
function buildAnswer(request: AiChatRequest): string {
  const latest = request.messages[request.messages.length - 1]?.content.toLowerCase() ?? '';

  if (request.role === 'staff') {
    // A "trilingual announcement" request must actually produce EN/ES/FR text,
    // not just describe it — otherwise the staff quick-command overpromises.
    if (latest.includes('trilingual') || latest.includes('announcement') || latest.includes('announce')) {
      return [
        `- EN: Please avoid East Concourse due to heavy crowding. Follow blue signs to ${REDIRECT_TARGET}; step-free guests use Gate N2 and Accessible Lift A.`,
        `- ES: Evite East Concourse por aglomeracion. Siga las senales azules hacia ${REDIRECT_TARGET}; personas con movilidad reducida usen Gate N2 y Accessible Lift A.`,
        `- FR: Evitez East Concourse (forte affluence). Suivez les panneaux bleus vers ${REDIRECT_TARGET}; acces PMR par Gate N2 et Accessible Lift A.`
      ].join('\n');
    }

    return [
      '- Priority: high',
      `- Crowd Management: redirect fans from East Concourse to ${REDIRECT_TARGET} while opening overflow lanes.`,
      '- Sustainability: reduce HVAC power in low-occupancy sectors (below 30%) by 20%.',
      '- Multilingual Ops: publish EN/ES/FR wayfinding updates to gate screens and volunteers.'
    ].join('\n');
  }

  if (latest.includes('transit') || latest.includes('transport') || latest.includes('rail')) {
    if (request.language === 'es') {
      return 'La opcion mas rapida y ecologica es el tren NJ Transit desde West Transit Hub. El rideshare abre en el Lot C por olas para reducir congestion.';
    }
    if (request.language === 'fr') {
      return 'L option la plus rapide et ecologique est le train NJ Transit depuis West Transit Hub. Le covoiturage ouvre au Lot C par vagues.';
    }
    return 'The fastest, greenest option is NJ Transit Rail from the West Transit Hub. Rideshare opens in Lot C in waves to reduce congestion.';
  }

  if (latest.includes('food') || latest.includes('restroom') || latest.includes('comida') || latest.includes('bano')) {
    if (request.language === 'es') {
      return 'El puesto con menos fila esta en South Lower Bowl. Evita East Concourse por alta densidad. Hay banos accesibles junto al Accessible Lift A.';
    }
    if (request.language === 'fr') {
      return 'Le stand le moins charge est au South Lower Bowl. Evitez East Concourse (forte densite). Toilettes accessibles pres de Accessible Lift A.';
    }
    return 'The shortest-queue stand is in South Lower Bowl. Avoid the busy East Concourse. Accessible restrooms are beside Accessible Lift A.';
  }

  if (request.language === 'es') {
    return 'Usa Gate N2, sigue al Accessible Lift A y baja en Level 2. Sigue las senales azules a Section 142. Evita escaleras; hay voluntarios cerca.';
  }
  if (request.language === 'fr') {
    return 'Prenez Gate N2, allez vers Accessible Lift A, sortez au Level 2, puis suivez les panneaux bleus vers Section 142. Un benevole peut aider.';
  }
  return 'Use Gate N2, continue to Accessible Lift A, exit at Level 2, then follow blue signs to Section 142. Avoid stairs; volunteers can assist nearby.';
}

/**
 * Deterministic, offline AI provider. Streams pre-composed answers
 * token-by-token to simulate real streaming behaviour without network calls.
 * Used as the default when no Vertex AI credentials are configured.
 */
export class MockAiProvider implements AiProvider {
  public readonly mode = 'mock' as const;

  /**
   * Streams a grounded answer by splitting it into whitespace-delimited tokens
   * with a small delay between each, mimicking real LLM streaming.
   *
   * @param request - The chat request containing role, language, and messages.
   * @yields Individual tokens of the composed answer.
   */
  public async *streamChat(request: AiChatRequest): AsyncIterable<string> {
    const answer = buildAnswer(request);
    const tokens = answer.split(/(\s+)/).filter(Boolean);

    for (const token of tokens) {
      yield token;
      await new Promise((resolve) => setTimeout(resolve, TOKEN_DELAY_MS));
    }
  }
}
