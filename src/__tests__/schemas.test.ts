import { chatSchema, MAX_MESSAGE_LENGTH, MAX_MESSAGES_PER_REQUEST } from '@/lib/validators/schemas';

describe('Chat Schema Security', () => {
  it('accepts a valid fan payload', () => {
    const valid = { messages: [{ role: 'user', content: 'Hi' }], language: 'en', userRole: 'fan' };

    expect(chatSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects payload missing language', () => {
    const invalid = { messages: [{ role: 'user', content: 'Hi' }], userRole: 'fan' };

    expect(chatSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects content over 500 chars for prompt injection prevention', () => {
    const invalid = {
      messages: [{ role: 'user', content: 'a'.repeat(MAX_MESSAGE_LENGTH + 1) }],
      language: 'en',
      userRole: 'fan'
    };

    expect(chatSchema.safeParse(invalid).success).toBe(false);
  });

  it('rejects excessive message history', () => {
    const invalid = {
      messages: Array.from({ length: MAX_MESSAGES_PER_REQUEST + 1 }, () => ({ role: 'user', content: 'Hi' })),
      language: 'en',
      userRole: 'staff'
    };

    expect(chatSchema.safeParse(invalid).success).toBe(false);
  });
});
