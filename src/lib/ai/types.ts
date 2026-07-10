import type { Language, UserRole } from '@/types';

export type AiMode = 'vertex' | 'mock';

/**
 * A single grounded generation request. `context` is server-derived live
 * venue state; `messages` is untrusted free-text intent from the client.
 */
export interface AiChatRequest {
  role: UserRole;
  language: Language;
  context: string;
  messages: { role: 'user' | 'assistant'; content: string }[];
}

/**
 * One AI interface, two implementations. The mock provider is deterministic
 * and offline so every route is demoable and testable with zero secrets and
 * zero cost; the Vertex provider is swapped in only when configured.
 */
export interface AiProvider {
  readonly mode: AiMode;
  /** Streams the grounded answer token-by-token. */
  streamChat(request: AiChatRequest): AsyncIterable<string>;
}
