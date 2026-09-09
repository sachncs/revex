/**
 * Rate limiting middleware.
 *
 * Simple sliding-window counter keyed by IP + workspace. Default
 * limits: 60 req/min/IP and 600 req/min/workspace. Override via
 * `RateLimitOptions`.
 *
 * Memory-only — restart the daemon to reset counters. Production
 * deployments should swap this for a Redis-backed bucket; this
 * implementation is the single-process baseline.
 *
 * Security:
 *   - Per-IP key is the socket peer address unless the peer is in
 *     `trustedProxyCidrs`, in which case the left-most entry of
 *     `X-Forwarded-For` is honored. This blocks the trivially
 *     spoofable-header bypass when the API is exposed directly.
 *   - Per-workspace key is the `workspace_id` claim from a
 *     signature-verified JWT. An unauthenticated attacker cannot
 *     rotate fake `workspace_id` claims to spread load across
 *     fresh buckets.
 */

import type { Context, MiddlewareHandler } from 'hono';
import type { JwtService } from '@revex/core';
import { isIPv4InCidr, isIPv6InCidr } from './cidr.js';

interface Bucket {
  readonly key: string;
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  readonly perIpPerMinute?: number;
  readonly perWorkspacePerMinute?: number;
  readonly bypassPaths?: readonly string[];
  /**
   * Optional explicit peer address. When set, used instead of
   * `c.env.remote.address` (useful in tests and behind proxies
   * that populate the field themselves).
   */
  readonly peerAddressResolver?: (c: Context) => string | null;
  /**
   * Optional CIDR list (IPv4 or IPv6) of trusted reverse-proxy
   * addresses. When the immediate socket peer matches one of
   * these CIDRs, the left-most `X-Forwarded-For` entry is used
   * as the per-IP key. Otherwise the socket peer is used and
   * the XFF header is ignored.
   */
  readonly trustedProxyCidrs?: readonly string[];
  /**
   * JWT verifier. When provided, the per-workspace bucket is
   * keyed on the verified `workspace_id` claim from the bearer
   * token. When omitted or the token fails verification, only
   * the per-IP bucket applies.
   */
  readonly jwt?: JwtService;
}

const DEFAULTS: Required<Omit<RateLimitOptions, 'bypassPaths' | 'peerAddressResolver' | 'trustedProxyCidrs' | 'jwt'>> = {
  perIpPerMinute: 60,
  perWorkspacePerMinute: 600,
};

const WINDOW_MS = 60_000;

const hostnameOrAddress = (c: Context): string | null => {
  const env = c.env as { remote?: { address?: string } } | undefined;
  const remote = env?.remote;
  return remote && typeof remote.address === 'string' && remote.address.length > 0
    ? remote.address
    : null;
};

const isTrustedPeer = (peer: string, cidrs: readonly string[]): boolean => {
  for (const cidr of cidrs) {
    if (cidr.includes(':')) {
      if (isIPv6InCidr(peer, cidr)) return true;
    } else if (isIPv4InCidr(peer, cidr)) {
      return true;
    }
  }
  return false;
};

const clientIp = (
  c: Context,
  resolver: ((c: Context) => string | null) | undefined,
  trustedCidrs: readonly string[],
): string => {
  const peer = (resolver ? resolver(c) : null) ?? hostnameOrAddress(c) ?? 'unknown';
  if (peer === 'unknown') return 'unknown';
  const xff = c.req.header('x-forwarded-for');
  if (xff && trustedCidrs.length > 0 && isTrustedPeer(peer, trustedCidrs)) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return peer;
};

const readVerifiedWorkspaceId = async (c: Context, jwt: JwtService | undefined): Promise<string | null> => {
  if (!jwt) return null;
  const auth = c.req.header('authorization') ?? '';
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  if (!m || !m[1]) return null;
  try {
    const claims = await jwt.verify(m[1]);
    return claims.workspace_id ?? null;
  } catch {
    /* Signature invalid or expired — fall back to per-IP only. */
    return null;
  }
};

export const rateLimitMiddleware = (opts: RateLimitOptions = {}): MiddlewareHandler => {
  const perIpLimit = opts.perIpPerMinute ?? DEFAULTS.perIpPerMinute;
  const perWsLimit = opts.perWorkspacePerMinute ?? DEFAULTS.perWorkspacePerMinute;
  const ipBuckets = new Map<string, Bucket>();
  const wsBuckets = new Map<string, Bucket>();
  const bypass = new Set(opts.bypassPaths ?? ['/health', '/readyz']);
  const trustedCidrs = opts.trustedProxyCidrs ?? [];

  const take = (buckets: Map<string, Bucket>, key: string, limit: number): { allowed: boolean; resetAt: number } => {
    const now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { key, count: 0, resetAt: now + WINDOW_MS };
      buckets.set(key, bucket);
    }
    bucket.count++;
    return { allowed: bucket.count <= limit, resetAt: bucket.resetAt };
  };

  const cleanup = (buckets: Map<string, Bucket>): void => {
    const now = Date.now();
    for (const [k, b] of buckets.entries()) {
      if (b.resetAt < now) buckets.delete(k);
    }
  };

  setInterval(() => {
    cleanup(ipBuckets);
    cleanup(wsBuckets);
  }, WINDOW_MS).unref();

  return async (c, next) => {
    const path = c.req.path;
    if (bypass.has(path)) return await next();

    const ip = clientIp(c, opts.peerAddressResolver, trustedCidrs);
    const ipCheck = take(ipBuckets, ip, perIpLimit);
    if (!ipCheck.allowed) {
      c.header('retry-after', String(Math.ceil((ipCheck.resetAt - Date.now()) / 1000)));
      return c.json({ error: { code: 'rate_limit', message: 'per-IP limit exceeded' } }, 429);
    }

    const workspaceId = await readVerifiedWorkspaceId(c, opts.jwt);
    if (workspaceId) {
      const wsCheck = take(wsBuckets, workspaceId, perWsLimit);
      if (!wsCheck.allowed) {
        c.header('retry-after', String(Math.ceil((wsCheck.resetAt - Date.now()) / 1000)));
        return c.json({ error: { code: 'rate_limit', message: 'per-workspace limit exceeded' } }, 429);
      }
    }

    return await next();
  };
};
