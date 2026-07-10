/**
 * @jest-environment node
 */
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns a liveness response with status, aiMode, and time fields', async () => {
    const response = GET();
    expect(response.status).toBe(200);

    const body = await response.json();

    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('aiMode');
    expect(typeof body.aiMode).toBe('string');
    expect(body.aiMode.length).toBeGreaterThan(0);
    expect(body).toHaveProperty('time');
    expect(typeof body.time).toBe('string');
    // time should be a valid ISO string
    expect(Number.isNaN(Date.parse(body.time))).toBe(false);
  });
});
