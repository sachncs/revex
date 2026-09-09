/**
 * Cross-Site Request Forgery middleware.
 *
 * Verifies the `Origin` header on state-changing requests (POST,
 * PATCH, PUT, DELETE) against the allowlist of configured origins.
 * Requests whose Origin does not match the allowlist are rejected
 * with `403 csrf_rejected`.
 *
 * Why Origin and not a token:
 *   The auth surface is JWT-in-cookie (`revex_session`,
 *   `revex_workspace_key`). SameSite=Lax blocks most cross-site
 *   CSRF in modern browsers, but older browsers, same-site
 *   scripted contexts, and any future switch to SameSite=None
 *   would expose state-changing endpoints. The Origin check is
 *   the second line of defence.
 *
 * Bypass rules:
 *   - `GET`, `HEAD`, `OPTIONS` are always allowed (no state change).
 *   - Same-origin requests are allowed without an Origin check.
 *   - Server-to-server callers can pass an explicit Origin header.
 *   - The `/health` and `/readyz` probes are always allowed.
 */

import type { Context, MiddlewareHandler } from 'hono';

export interface CsrfOptions {
  readonly allowOrigins?: readonly string[];
  readonly alwaysAllow?: readonly string[];
}

const STATE_CHANGING = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

const DEFAULT_ALLOW: readonly string[] = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const isSameOrigin = (req: Request, origin: string): boolean => {
  try {
    const url = new URL(req.url);
    return `${url.protocol}//${url.host}` === origin;
  } catch {
    return false;
  }
};

export const csrfMiddleware = (opts: CsrfOptions = {}): MiddlewareHandler => {
  const allow = new Set(opts.allowOrigins ?? DEFAULT_ALLOW);
  const alwaysAllow = new Set(opts.alwaysAllow ?? ['/health', '/readyz']);
  return async (c: Context, next) => {
    if (!STATE_CHANGING.has(c.req.method)) {
      return await next();
    }
    const path = c.req.path;
    if (alwaysAllow.has(path)) {
      return await next();
    }
    const origin = c.req.header('origin');
    if (!origin) {
      return c.json(
        { error: { code: 'csrf_rejected', message: 'Origin header is required for state-changing requests' } },
        403,
      );
    }
    if (allow.has(origin) || isSameOrigin(c.req.raw, origin)) {
      return await next();
    }
    return c.json(
      { error: { code: 'csrf_rejected', message: `Origin ${origin} not allowed` } },
      403,
    );
  };
};
