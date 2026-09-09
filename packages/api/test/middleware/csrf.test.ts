import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';

import { csrfMiddleware } from '../../src/middleware/csrf.js';

const buildApp = (allow: readonly string[]) => {
  const app = new Hono();
  app.use(
    '*',
    csrfMiddleware({
      allowOrigins: allow,
      alwaysAllow: ['/health', '/readyz'],
    }),
  );
  app.get('/health', (c) => c.json({ ok: true }));
  app.post('/v1/documents', (c) => c.json({ ok: true }));
  app.patch('/v1/workspaces/members/:id', (c) => c.json({ ok: true }));
  return app;
};

describe('csrfMiddleware', () => {
  it('allows GETs without an Origin header', async () => {
    const app = buildApp(['https://app.example.com']);
    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });

  it('allows POSTs whose Origin is in the allowlist', async () => {
    const app = buildApp(['https://app.example.com']);
    const res = await app.request('/v1/documents', {
      method: 'POST',
      headers: { origin: 'https://app.example.com' },
    });
    expect(res.status).toBe(200);
  });

  it('rejects POSTs with a mismatched Origin', async () => {
    const app = buildApp(['https://app.example.com']);
    const res = await app.request('/v1/documents', {
      method: 'POST',
      headers: { origin: 'https://evil.example.com' },
    });
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('csrf_rejected');
  });

  it('rejects POSTs without an Origin header', async () => {
    const app = buildApp(['https://app.example.com']);
    const res = await app.request('/v1/documents', { method: 'POST' });
    expect(res.status).toBe(403);
  });

  it('rejects PATCHes from a foreign Origin', async () => {
    const app = buildApp(['https://app.example.com']);
    const res = await app.request('/v1/workspaces/members/usr_1', {
      method: 'PATCH',
      headers: { origin: 'https://attacker.example.com', 'content-type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    expect(res.status).toBe(403);
  });
});
