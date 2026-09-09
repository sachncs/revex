import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';

import { JwtService } from '@revex/core';

import { rateLimitMiddleware } from '../../src/middleware/rate-limit.js';

const makeJwt = (): JwtService =>
  new JwtService({
    secret: 'a'.repeat(32),
    algorithm: 'HS256',
    ttlSeconds: 60,
  });

const appWith = (opts: Parameters<typeof rateLimitMiddleware>[0] = {}) => {
  const app = new Hono();
  app.use('*', rateLimitMiddleware({ perIpPerMinute: 2, perWorkspacePerMinute: 2, ...opts }));
  app.get('/p', (c) => c.json({ ok: true }));
  return app;
};

const peer = (ip: string | null): { remote?: { address: string } } =>
  ip ? { remote: { address: ip } } : {};

describe('rateLimitMiddleware', () => {
  it('uses the socket peer address when no trusted proxy is configured', async () => {
    const app = appWith();
    const res1 = await app.request('/p', { headers: { 'x-forwarded-for': '1.2.3.4' } });
    expect(res1.status).toBe(200);
    const res2 = await app.request('/p', { headers: { 'x-forwarded-for': '5.6.7.8' } });
    expect(res2.status).toBe(200);
    const res3 = await app.request('/p', { headers: { 'x-forwarded-for': '9.9.9.9' } });
    expect(res3.status).toBe(429);
  });

  it('honors X-Forwarded-For when the peer is in trustedProxyCidrs', async () => {
    const app = appWith({ trustedProxyCidrs: ['10.0.0.0/8'] });
    const res1 = await app.request('/p', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    }, peer('10.0.0.5') as never);
    expect(res1.status).toBe(200);
    const res2 = await app.request('/p', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    }, peer('10.0.0.5') as never);
    expect(res2.status).toBe(200);
    const res3 = await app.request('/p', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    }, peer('10.0.0.5') as never);
    expect(res3.status).toBe(429);
  });

  it('ignores a spoofed X-Forwarded-For when the peer is NOT in trustedProxyCidrs', async () => {
    const app = appWith({ trustedProxyCidrs: ['10.0.0.0/8'] });
    const res1 = await app.request('/p', {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    }, peer('203.0.113.7') as never);
    expect(res1.status).toBe(200);
    const res2 = await app.request('/p', {
      headers: { 'x-forwarded-for': '5.6.7.8' },
    }, peer('203.0.113.7') as never);
    expect(res2.status).toBe(200);
    const res3 = await app.request('/p', {
      headers: { 'x-forwarded-for': '9.9.9.9' },
    }, peer('203.0.113.7') as never);
    expect(res3.status).toBe(429);
  });

  it('does not key the per-workspace bucket on an unverified token', async () => {
    const jwt = makeJwt();
    const app = appWith({ jwt, perIpPerMinute: 100 });
    const forged = `Bearer ${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"workspace_id":"victim"}').toString('base64url')}`;
    for (let i = 0; i < 5; i += 1) {
      const res = await app.request('/p', {
        headers: { authorization: forged },
      }, peer('203.0.113.20') as never);
      expect(res.status).toBe(200);
    }
  });

  it('does key the per-workspace bucket on a verified token', async () => {
    const jwt = makeJwt();
    const token = await jwt.mint({
      subject: 'usr_1',
      workspaceId: 'wsp_alpha',
      isAdmin: false,
    });
    const app = appWith({ jwt, perWorkspacePerMinute: 2, perIpPerMinute: 100 });
    const res1 = await app.request('/p', {
      headers: { authorization: `Bearer ${token}` },
    }, peer('203.0.113.30') as never);
    expect(res1.status).toBe(200);
    const res2 = await app.request('/p', {
      headers: { authorization: `Bearer ${token}` },
    }, peer('203.0.113.31') as never);
    expect(res2.status).toBe(200);
    const res3 = await app.request('/p', {
      headers: { authorization: `Bearer ${token}` },
    }, peer('203.0.113.32') as never);
    expect(res3.status).toBe(429);
  });

  it('bypasses configured paths regardless of bucket state', async () => {
    const app = new Hono();
    app.use('*', rateLimitMiddleware({ perIpPerMinute: 2, bypassPaths: ['/health'] }));
    app.get('/health', (c) => c.json({ ok: true }));
    for (let i = 0; i < 5; i += 1) {
      const res = await app.request('/health');
      expect(res.status).toBe(200);
    }
  });
});
