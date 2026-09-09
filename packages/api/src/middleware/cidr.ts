/**
 * IPv4 / IPv6 CIDR matching helpers.
 *
 * Used by the rate limiter to decide whether the immediate socket
 * peer is in a trusted reverse-proxy range; only then is the
 * `X-Forwarded-For` header honored as the per-IP key.
 *
 * Intentionally small (no external deps). Validates the CIDR
 * shape on construction and throws on malformed input so the
 * boot path fails fast on bad `REVEX_TRUSTED_PROXY_CIDRS`.
 */

export class CidrError extends Error {}

const parseIpv4 = (raw: string): number[] => {
  const parts = raw.split('.');
  if (parts.length !== 4) throw new CidrError(`invalid IPv4: ${raw}`);
  const out: number[] = [];
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isInteger(n) || n < 0 || n > 255) throw new CidrError(`invalid IPv4 octet: ${p}`);
    out.push(n);
  }
  return out;
};

const parseIpv4Cidr = (cidr: string): { mask: number; base: number } => {
  const [ip, bitsStr] = cidr.split('/');
  if (!ip || bitsStr === undefined) throw new CidrError(`CIDR missing '/<bits>': ${cidr}`);
  const bits = Number(bitsStr);
  if (!Number.isInteger(bits) || bits < 0 || bits > 32) throw new CidrError(`invalid IPv4 CIDR bits: ${bitsStr}`);
  const octets = parseIpv4(ip);
  const base = ((octets[0] ?? 0) << 24 >>> 0) + ((octets[1] ?? 0) << 16) + ((octets[2] ?? 0) << 8) + (octets[3] ?? 0);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return { mask, base: base & mask };
};

const parseIpv6Cidr = (cidr: string): { baseHi: bigint; baseLo: bigint; maskHi: bigint; maskLo: bigint } => {
  const [ip, bitsStr] = cidr.split('/');
  if (!ip || bitsStr === undefined) throw new CidrError(`CIDR missing '/<bits>': ${cidr}`);
  const bits = Number(bitsStr);
  if (!Number.isInteger(bits) || bits < 0 || bits > 128) throw new CidrError(`invalid IPv6 CIDR bits: ${bitsStr}`);
  const addr = ipv6ToBigInt(ip);
  /* Compute mask as a 128-bit value, then split at the 64-bit
   * boundary. All-zero when bits === 0; all-ones when bits === 128. */
  const mask128 = bits === 0 ? 0n : ((1n << BigInt(bits)) - 1n) << BigInt(128 - bits);
  const maskHi = mask128 >> 64n;
  const maskLo = mask128 & ((1n << 64n) - 1n);
  return {
    baseHi: addr.hi & maskHi,
    baseLo: addr.lo & maskLo,
    maskHi,
    maskLo,
  };
};

const expandIpv6 = (raw: string): number[] => {
  /* Accept "::", "::1", "2001:db8::", or 8-group notation.
   * Returns 8 hextets (16-bit each) as numbers. */
  if (raw.includes('.')) {
    /* IPv4-mapped (::ffff:a.b.c.d) — convert and re-call. */
    throw new CidrError(`IPv4-mapped IPv6 not supported in CIDR parse: ${raw}`);
  }
  const doubleColon = raw.indexOf('::');
  let head: string[] = [];
  let tail: string[] = [];
  if (doubleColon === -1) {
    head = raw.split(':');
    if (head.length !== 8) throw new CidrError(`expected 8 hextets: ${raw}`);
  } else {
    const l = raw.slice(0, doubleColon);
    const r = raw.slice(doubleColon + 2);
    head = l === '' ? [] : l.split(':');
    tail = r === '' ? [] : r.split(':');
    if (head.length + tail.length > 7) throw new CidrError(`too many hextets: ${raw}`);
    const fill = 8 - head.length - tail.length;
    head = [...head, ...Array(fill).fill('0'), ...tail];
  }
  const hextets: number[] = [];
  for (const h of head) {
    const n = parseInt(h, 16);
    if (!Number.isFinite(n) || n < 0 || n > 0xffff) throw new CidrError(`invalid hextet: ${h}`);
    hextets.push(n);
  }
  return hextets;
};

const ipv6ToBigInt = (raw: string): { hi: bigint; lo: bigint } => {
  const hextets = expandIpv6(raw);
  let hi = 0n;
  let lo = 0n;
  for (let i = 0; i < 8; i += 1) {
    const h = BigInt(hextets[i] ?? 0);
    if (i < 4) {
      hi = (hi << 16n) | h;
    } else {
      lo = (lo << 16n) | h;
    }
  }
  return { hi, lo };
};

export const isIPv4InCidr = (ip: string, cidr: string): boolean => {
  const octets = parseIpv4(ip);
  const addr = ((octets[0] ?? 0) << 24 >>> 0) + ((octets[1] ?? 0) << 16) + ((octets[2] ?? 0) << 8) + (octets[3] ?? 0);
  const { mask, base } = parseIpv4Cidr(cidr);
  return (addr & mask) === base;
};

export const isIPv6InCidr = (ip: string, cidr: string): boolean => {
  const addr = ipv6ToBigInt(ip);
  const { baseHi, baseLo, maskHi, maskLo } = parseIpv6Cidr(cidr);
  return (addr.hi & maskHi) === baseHi && (addr.lo & maskLo) === baseLo;
};

export const parseTrustedProxyCidrs = (raw: string | undefined): readonly string[] => {
  if (!raw) return [];
  const out: string[] = [];
  for (const piece of raw.split(/[\s,]+/).filter(Boolean)) {
    if (piece.includes(':')) {
      parseIpv6Cidr(piece);
    } else {
      parseIpv4Cidr(piece);
    }
    out.push(piece);
  }
  return out;
};
