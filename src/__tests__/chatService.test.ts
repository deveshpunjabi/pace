/**
 * @jest-environment node
 */
import { MockAiProvider } from '@/lib/ai/mockProvider';
import { buildLiveContext, streamChatAnswer } from '@/lib/services/chatService';
import type { ChatPayload } from '@/lib/validators/schemas';

async function collect(stream: AsyncIterable<string>): Promise<string> {
  let text = '';
  for await (const token of stream) {
    text += token;
  }
  return text;
}

describe('chatService.buildLiveContext', () => {
  it('grounds context in venue name, sectors, and knowledge base', () => {
    const context = buildLiveContext(1_700_000_000_000);
    expect(context).toContain('MetLife Stadium');
    expect(context).toContain('East Concourse');
    expect(context).toContain('Accessible Lift A');
  });
});

describe('chatService.streamChatAnswer with MockAiProvider', () => {
  const provider = new MockAiProvider();

  it('returns structured bullet guidance for staff', async () => {
    const payload: ChatPayload = {
      messages: [{ role: 'user', content: 'mitigation plan' }],
      language: 'en',
      userRole: 'staff'
    };
    const answer = await collect(streamChatAnswer(provider, payload, 1_700_000_000_000));
    expect(answer).toContain('- Priority: high');
  });

  it('answers a Spanish fan natively', async () => {
    const payload: ChatPayload = {
      messages: [{ role: 'user', content: 'ruta accesible' }],
      language: 'es',
      userRole: 'fan'
    };
    const answer = await collect(streamChatAnswer(provider, payload, 1_700_000_000_000));
    expect(answer).toContain('Accessible Lift A');
  });
});
