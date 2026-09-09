import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { Hono } from 'hono';

import { clearAuthCookies, setPassphraseCookie, setSessionCookie } from '../src/cookies.js';

describe('cookies', () => {
  const ORIGINAL_NODE_ENV = process.env['NODE_ENV'];
  const ORIGINAL_PROFILE = process.env['REVEX_PROFILE'];

  beforeEach(() => {
    delete process.env['REVEX_PROFILE'];
    process.env['NODE_ENV'] = 'test';
  });

  afterEach(() => {
    if (ORIGINAL_NODE_ENV === undefined) delete process.env['NODE_ENV'];
    else process.env['NODE_ENV'] = ORIGINAL_NODE_ENV;
    if (ORIGINAL_PROFILE === undefined) delete process.env['REVEX_PROFILE'];
    else process.env['REVEX_PROFILE'] = ORIGINAL_PROFILE;
  });

  const collectSetCookies = (res: Response): string[] => {
    const single = res.headers.get('set-cookie');
    if (!single) return [];
    /* Hono / Undici may expose multiple Set-Cookie values via
     * getSetCookie() on Headers; fall back to comma-split for
     * older runtimes (the test environment only uses one or two
     * cookies so a naive split is fine). */
    const all = (res.headers as Headers & { getSetCookie?: () => string[] }).getSetCookie?.();
    if (all && all.length > 0) return all;
    return single.split(/,(?=[^ ]+=)/);
  };

  it('sets HttpOnly + SameSite=Lax in non-production profiles', async () => {
    const app = new Hono();
    app.get('/x', (c) => {
      setSessionCookie(c, 'tok_123');
      setPassphraseCookie(c, 'pp_456');
      return c.json({ ok: true });
    });
    const res = await app.request('/x');
    const cookies = collectSetCookies(res);
    expect(cookies.some((c) => c.startsWith('revex_session='))).toBe(true);
    expect(cookies.some((c) => c.startsWith('revex_workspace_key='))).toBe(true);
    for (const cookie of cookies) {
      expect(cookie.toLowerCase()).toContain('httponly');
      expect(cookie.toLowerCase()).toContain('samesite=lax');
      expect(cookie.toLowerCase()).not.toContain('secure');
    }
  });

  it('adds Secure when REVEX_PROFILE=production', async () => {
    process.env['REVEX_PROFILE'] = 'production';
    const app = new Hono();
    app.get('/x', (c) => {
      setSessionCookie(c, 'tok_123');
      return c.json({ ok: true });
    });
    const res = await app.request('/x');
    const cookies = collectSetCookies(res);
    expect(cookies.some((c) => c.toLowerCase().includes('secure'))).toBe(true);
  });

  it('clearAuthCookies emits Max-Age=0 for both cookies with matching flags', async () => {
    const app = new Hono();
    app.post('/x', (c) => {
      clearAuthCookies(c);
      return c.json({ ok: true });
    });
    const res = await app.request('/x', { method: 'POST' });
    const cookies = collectSetCookies(res);
    expect(cookies.some((c) => c.startsWith('revex_session=') && /max-age=0/i.test(c))).toBe(true);
    expect(cookies.some((c) => c.startsWith('revex_workspace_key=') && /max-age=0/i.test(c))).toBe(true);
  });
});
