import { z } from 'zod';

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_MESSAGES_PER_REQUEST = 10;

export const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH)
});

export const chatSchema = z.object({
  messages: z.array(messageSchema).min(1).max(MAX_MESSAGES_PER_REQUEST),
  language: z.enum(['en', 'es', 'fr']),
  userRole: z.enum(['fan', 'staff'])
});

export type ChatPayload = z.infer<typeof chatSchema>;
