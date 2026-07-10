import { rateLimit, resetRateLimits } from '@/lib/security/rateLimit';

describe('security.rateLimit', () => {
  beforeEach(() => resetRateLimits());

  it('allows requests up to the limit then blocks', () => {
    const key = 'client-a';
    const now = 1_000;

    for (let i = 0; i < 3; i += 1) {
      expect(rateLimit(key, 3, 60_000, now).allowed).toBe(true);
    }

    const blocked = rateLimit(key, 3, 60_000, now);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('resets after the window elapses', () => {
    const key = 'client-b';
    rateLimit(key, 1, 1_000, 0);
    expect(rateLimit(key, 1, 1_000, 500).allowed).toBe(false);
    expect(rateLimit(key, 1, 1_000, 1_500).allowed).toBe(true);
  });

  it('isolates buckets per key', () => {
    expect(rateLimit('x', 1, 1_000, 0).allowed).toBe(true);
    expect(rateLimit('y', 1, 1_000, 0).allowed).toBe(true);
  });
});
