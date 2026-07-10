import { VertexAI } from '@google-cloud/vertexai';
import type { AiChatRequest, AiProvider } from '@/lib/ai/types';
import { generateSystemPrompt } from '@/lib/ai/prompts';

export interface VertexConfig {
  projectId: string;
  location: string;
  model: string;
}

/** Real Google Vertex AI provider. Only constructed when GCP env is present. */
export class VertexAiProvider implements AiProvider {
  public readonly mode = 'vertex' as const;

  private readonly config: VertexConfig;

  public constructor(config: VertexConfig) {
    this.config = config;
  }

  public async *streamChat(request: AiChatRequest): AsyncIterable<string> {
    const vertex = new VertexAI({ project: this.config.projectId, location: this.config.location });
    const model = vertex.getGenerativeModel({
      model: this.config.model,
      systemInstruction: generateSystemPrompt(request.role, request.language, request.context)
    });

    const result = await model.generateContentStream({
      contents: request.messages.map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      }))
    });

    for await (const chunk of result.stream) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        yield text;
      }
    }
  }
}
