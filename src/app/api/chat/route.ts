import { VertexAI, type Tool } from '@google-cloud/vertexai';
import { NextRequest, NextResponse } from 'next/server';
import { generateSystemPrompt } from '@/lib/ai/prompts';
import { paceTools } from '@/lib/ai/tools';
import { chatSchema, type ChatPayload } from '@/lib/validators/schemas';
import type { Message } from '@/types';

export const runtime = 'nodejs';

function buildFallbackResponse(payload: ChatPayload): string {
  const latestMessage = payload.messages[payload.messages.length - 1]?.content.toLowerCase() ?? '';

  if (payload.userRole === 'staff') {
    return [
      '- Priority: high',
      '- Crowd Management: redirect fans from East Concourse to South Lower Bowl while opening overflow lanes.',
      '- Sustainability: reduce HVAC power in S3 and S6 by 20% because density is below 30%.',
      '- Multilingual Ops: publish EN/ES/FR wayfinding updates to gate screens and volunteers.'
    ].join('\n');
  }

  if (payload.language === 'es') {
    return 'Usa Gate N2, sigue al Accessible Lift A y baja en Level 2. Sigue las senales azules a Section 142. Evita escaleras y pide apoyo al voluntario cercano.';
  }

  if (payload.language === 'fr') {
    return 'Prenez Gate N2, allez vers Accessible Lift A, sortez au Level 2, puis suivez les panneaux bleus vers Section 142. Un benevole peut aider.';
  }

  if (latestMessage.includes('transit')) {
    return 'Use the West Transit Hub after the match. Light rail is fastest, and rideshare opens in Lot C waves to reduce congestion.';
  }

  return 'Use Gate N2, continue to Accessible Lift A, exit Level 2, then follow blue signs to Section 142. Volunteers can assist nearby.';
}

function streamText(text: string): Response {
  const encoder = new TextEncoder();
  const tokens = text.split(/(\s+)/).filter(Boolean);

  return new Response(
    new ReadableStream<Uint8Array>({
      async start(controller) {
        for (const token of tokens) {
          controller.enqueue(encoder.encode(token));
          await new Promise((resolve) => setTimeout(resolve, 8));
        }

        controller.close();
      }
    }),
    {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8'
      }
    }
  );
}

function toVertexContents(messages: Message[]) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }]
  }));
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const parsed = chatSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.issues }, { status: 400 });
    }

    const payload = parsed.data;
    const projectId = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION ?? 'us-central1';
    const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
    const useVertex = process.env.PACE_AI_PROVIDER === 'vertex' && Boolean(projectId);

    if (!useVertex) {
      return streamText(buildFallbackResponse(payload));
    }

    const vertex = new VertexAI({ project: projectId, location });
    const model = vertex.getGenerativeModel({
      model: modelName,
      systemInstruction: generateSystemPrompt(payload.userRole, payload.language),
      tools: paceTools as unknown as Tool[]
    });

    const result = await model.generateContentStream({ contents: toVertexContents(payload.messages) });
    const encoder = new TextEncoder();

    return new Response(
      new ReadableStream<Uint8Array>({
        async start(controller) {
          for await (const chunk of result.stream) {
            const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();
        }
      }),
      {
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'text/plain; charset=utf-8'
        }
      }
    );
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
