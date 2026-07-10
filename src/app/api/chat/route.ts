import { NextResponse } from 'next/server';
import { resolveAiProvider } from '@/lib/ai/provider';
import { enforceRequestGuards } from '@/lib/security/guard';
import { streamChatAnswer } from '@/lib/services/chatService';
import { chatSchema } from '@/lib/validators/schemas';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const guard = enforceRequestGuards(request, rawBody);

  if (!guard.ok) {
    return NextResponse.json({ error: guard.message, code: guard.code }, { status: guard.status });
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Malformed JSON body.', code: 'invalid_json' }, { status: 400 });
  }

  const parsed = chatSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid payload.', code: 'invalid_payload', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const provider = resolveAiProvider();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const token of streamChatAnswer(provider, parsed.data)) {
          controller.enqueue(encoder.encode(token));
        }
      } catch {
        controller.enqueue(encoder.encode('PACE is temporarily unavailable. Please retry from a nearby help point.'));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
      'X-PACE-AI-Mode': provider.mode
    }
  });
}
