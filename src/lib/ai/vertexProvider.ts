/**
 * @module lib/ai/vertexProvider
 *
 * Real Google Vertex AI (Gemini) provider. Only constructed when GCP
 * environment variables are present. Streams responses token-by-token
 * using the Vertex AI SDK's content streaming API.
 */

import { VertexAI } from '@google-cloud/vertexai';
import type { AiChatRequest, AiProvider } from '@/lib/ai/types';
import { generateSystemPrompt } from '@/lib/ai/prompts';

/**
 * Configuration required to connect to a Vertex AI Gemini model.
 * All values come from validated environment variables.
 */
export interface VertexConfig {
  readonly projectId: string;
  readonly location: string;
  readonly model: string;
}

/**
 * Production AI provider backed by Google Vertex AI (Gemini). Constructs a
 * fresh client per request to respect dynamic configuration and avoid stale
 * connections in serverless environments.
 */
export class VertexAiProvider implements AiProvider {
  public readonly mode = 'vertex' as const;

  private readonly config: VertexConfig;

  /**
   * @param config - GCP project, location, and model identifiers.
   */
  public constructor(config: VertexConfig) {
    this.config = config;
  }

  /**
   * Streams a grounded response from Gemini by sending the system prompt
   * (with live venue context) and conversation history to the model.
   *
   * @param request - Chat request with role, language, context, and message history.
   * @yields Text chunks as they arrive from the Vertex AI streaming API.
   */
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
