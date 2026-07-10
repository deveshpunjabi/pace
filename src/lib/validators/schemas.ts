/**
 * @module lib/validators/schemas
 *
 * Zod validation schemas for API payloads. Every `/api/chat` request is
 * parsed through these schemas before any business logic runs, ensuring
 * strict input validation and type-safe downstream access.
 */

import { z } from 'zod';

/** Maximum allowed character length for a single chat message. */
export const MAX_MESSAGE_LENGTH = 500;

/** Maximum number of messages allowed in a single chat request. */
export const MAX_MESSAGES_PER_REQUEST = 10;

/**
 * Schema for a single message in the conversation history. Enforces role
 * enumeration, non-empty content, and maximum length.
 */
export const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH)
});

/**
 * Schema for the complete chat API request payload. Validates message array
 * bounds, language selection, and user role.
 */
export const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES_PER_REQUEST),
  language: z.enum(['en', 'es', 'fr']),
  userRole: z.enum(['fan', 'staff'])
});

/** Inferred TypeScript type from the chat schema for type-safe access. */
export type ChatPayload = z.infer<typeof chatSchema>;
