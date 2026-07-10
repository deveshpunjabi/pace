import type { AiChatRequest, AiProvider } from '@/lib/ai/types';
import { REDIRECT_TARGET } from '@/lib/data/venue';

function buildAnswer(request: AiChatRequest): string {
  const latest = request.messages[request.messages.length - 1]?.content.toLowerCase() ?? '';

  if (request.role === 'staff') {
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

/** Deterministic, offline provider — zero secrets, zero cost, fully testable. */
export class MockAiProvider implements AiProvider {
  public readonly mode = 'mock' as const;

  public async *streamChat(request: AiChatRequest): AsyncIterable<string> {
    const answer = buildAnswer(request);
    const tokens = answer.split(/(\s+)/).filter(Boolean);

    for (const token of tokens) {
      yield token;
      await new Promise((resolve) => setTimeout(resolve, 8));
    }
  }
}
