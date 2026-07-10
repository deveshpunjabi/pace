/**
 * @module lib/ai/types
 *
 * Defines the AI provider abstraction layer. This interface lets the
 * application swap between a deterministic mock (zero-cost, offline) and a
 * real Vertex AI provider without changing any consumer code.
 */

import type { Language, UserRole } from '@/types';

/** Identifies which AI backend is active — used in health probes and response headers. */
export type AiMode = 'vertex' | 'mock';

/**
 * A single grounded generation request sent to the AI provider.
 * `context` is server-derived live venue state (trusted); `messages` is
 * untrusted free-text intent from the client — the split keeps the trust
 * boundary explicit.
 */
export interface AiChatRequest {
  readonly role: UserRole;
  readonly language: Language;
  readonly context: string;
  readonly messages: ReadonlyArray<{ readonly role: 'user' | 'assistant'; readonly content: string }>;
}

/**
 * One AI interface, two implementations. The mock provider is deterministic
 * and offline so every route is demoable and testable with zero secrets and
 * zero cost; the Vertex provider is swapped in only when configured.
 */
export interface AiProvider {
  readonly mode: AiMode;
  /** Streams the grounded answer token-by-token for real-time UI updates. */
  streamChat(request: AiChatRequest): AsyncIterable<string>;
}
