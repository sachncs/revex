/**
 * Security headers + CORS.
 *
 * Adds:
 *   - `X-Content-Type-Options: nosniff`
 *   - `Referrer-Policy: no-referrer`
 *   - `X-Frame-Options: DENY`
 *   - `Content-Security-Policy` when REVEX_CSP is set
 *   - `Strict-Transport-Security` when REVEX_PROFILE=production
 *   - `Permissions-Policy` with a conservative default
 *
 * CORS:
 *   - Allowlist via REVEX_CORS_ORIGINS (comma-separated).
 *   - The Origin is echoed back as `Access-Control-Allow-Origin`
 *     when it matches the allowlist.
 *   - Wildcard (`*`) is rejected when REVEX_PROFILE=production.
 *   - `Access-Control-Allow-Credentials: true` is set when the
 *     Origin matches (cookies ride on cross-origin requests in
 *     the same-site case).
 *
 * Production deployments behind a reverse proxy should still
 * set CSP / HSTS at the proxy layer; this middleware is a
 * belt-and-braces fallback so a misconfigured deployment does
 * not ship with zero security headers.
 */

import type { Context, MiddlewareHandler } from 'hono';

export interface SecurityHeadersOptions {
  readonly allowOrigins?: readonly string[];
  readonly allowMethods?: readonly string[];
}

const DEFAULT_ORIGINS = [
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

const DEFAULT_PERMISSIONS_POLICY =
  'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()';

const isProduction = (): boolean =>
  process.env['REVEX_PROFILE'] === 'production' || process.env['NODE_ENV'] === 'production';

export const securityHeadersMiddleware = (
  opts: SecurityHeadersOptions = {},
): MiddlewareHandler => {
  const origins = opts.allowOrigins ?? DEFAULT_ORIGINS;
  const methods = opts.allowMethods ?? ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'];

  if (isProduction() && origins.includes('*')) {
    throw new Error(
      'REVEX_CORS_ORIGINS must not include "*" in production; configure the real frontend origin(s).',
    );
  }

  const isAllowed = (origin: string): boolean => origins.includes(origin);

  return async (c: Context, next) => {
    const origin = c.req.header('origin') ?? '';
    if (origin && isAllowed(origin)) {
      c.header('Access-Control-Allow-Origin', origin);
      c.header('Vary', 'Origin');
      c.header('Access-Control-Allow-Credentials', 'true');
      c.header('Access-Control-Allow-Methods', methods.join(', '));
      c.header('Access-Control-Allow-Headers', 'content-type, authorization, x-revex-path');
    }
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('Referrer-Policy', 'no-referrer');
    c.header('X-Frame-Options', 'DENY');
    c.header('Permissions-Policy', DEFAULT_PERMISSIONS_POLICY);

    const csp = process.env['REVEX_CSP'];
    if (csp && csp.length > 0) {
      c.header('Content-Security-Policy', csp);
    }

    if (isProduction()) {
      c.header(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload',
      );
    }

    if (c.req.method === 'OPTIONS') {
      return c.body(null, 204);
    }
    return await next();
  };
};
