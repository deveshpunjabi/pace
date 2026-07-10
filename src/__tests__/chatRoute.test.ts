/**
 * @jest-environment node
 */
import { POST } from '@/app/api/chat/route';
import { resetRateLimits } from '@/lib/security/rateLimit';

function chatRequest(body: unknown, contentType = 'application/json', ip = '10.1.0.1'): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': contentType, 'x-forwarded-for': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}

const validPayload = {
  messages: [{ role: 'user', content: 'accessible route please' }],
  language: 'en',
  userRole: 'fan'
};

describe('POST /api/chat', () => {
  beforeEach(() => resetRateLimits());

  it('streams a grounded answer on a valid request (200) and reports AI mode', async () => {
    const response = await POST(chatRequest(validPayload, 'application/json', '10.1.0.2'));
    expect(response.status).toBe(200);
    expect(response.headers.get('X-PACE-AI-Mode')).toBe('mock');
    expect((await response.text()).length).toBeGreaterThan(0);
  });

  it('rejects a non-JSON content type with 415', async () => {
    const response = await POST(chatRequest(validPayload, 'text/plain', '10.1.0.3'));
    expect(response.status).toBe(415);
  });

  it('rejects an invalid payload with 400', async () => {
    const response = await POST(
      chatRequest({ messages: [], language: 'en', userRole: 'fan' }, 'application/json', '10.1.0.4')
    );
    expect(response.status).toBe(400);
  });

  it('rate-limits a noisy client with 429', async () => {
    let response = await POST(chatRequest(validPayload, 'application/json', '10.1.0.9'));
    await response.body?.cancel();

    for (let i = 0; i < 25; i += 1) {
      response = await POST(chatRequest(validPayload, 'application/json', '10.1.0.9'));
      if (response.status === 200) {
        await response.body?.cancel();
      }
    }

    expect(response.status).toBe(429);
  });
});
