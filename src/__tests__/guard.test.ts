/**
 * @jest-environment node
 */
import { enforceRequestGuards, MAX_BODY_BYTES } from '@/lib/security/guard';
import { resetRateLimits } from '@/lib/security/rateLimit';

function makeRequest(contentType: string, ip = '10.0.0.1'): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'content-type': contentType, 'x-forwarded-for': ip }
  });
}

describe('security.enforceRequestGuards', () => {
  beforeEach(() => resetRateLimits());

  it('rejects non-JSON content types with 415', () => {
    const result = enforceRequestGuards(makeRequest('text/plain'), '{}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(415);
      expect(result.code).toBe('invalid_content_type');
    }
  });

  it('rejects oversized bodies with 413', () => {
    const big = 'a'.repeat(MAX_BODY_BYTES + 1);
    const result = enforceRequestGuards(makeRequest('application/json'), big);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(413);
    }
  });

  it('allows a valid request and eventually rate-limits the same client', () => {
    let last = enforceRequestGuards(makeRequest('application/json', '10.0.0.2'), '{}');
    expect(last.ok).toBe(true);

    for (let i = 0; i < 25; i += 1) {
      last = enforceRequestGuards(makeRequest('application/json', '10.0.0.2'), '{}');
    }

    expect(last.ok).toBe(false);
    if (!last.ok) {
      expect(last.status).toBe(429);
    }
  });
});
