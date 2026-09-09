import { describe, expect, it } from 'vitest';

import {
  CidrError,
  isIPv4InCidr,
  isIPv6InCidr,
  parseTrustedProxyCidrs,
} from '../../src/middleware/cidr.js';

describe('cidr', () => {
  describe('isIPv4InCidr', () => {
    it('matches a host inside the CIDR', () => {
      expect(isIPv4InCidr('10.0.0.5', '10.0.0.0/8')).toBe(true);
      expect(isIPv4InCidr('192.168.1.42', '192.168.0.0/16')).toBe(true);
      expect(isIPv4InCidr('1.2.3.4', '1.2.3.0/24')).toBe(true);
    });

    it('rejects a host outside the CIDR', () => {
      expect(isIPv4InCidr('11.0.0.5', '10.0.0.0/8')).toBe(false);
      expect(isIPv4InCidr('203.0.113.1', '192.168.0.0/16')).toBe(false);
      expect(isIPv4InCidr('1.2.4.4', '1.2.3.0/24')).toBe(false);
    });

    it('throws on malformed input', () => {
      expect(() => isIPv4InCidr('not-an-ip', '10.0.0.0/8')).toThrow(CidrError);
      expect(() => isIPv4InCidr('10.0.0.1', 'not-a-cidr')).toThrow(CidrError);
      expect(() => isIPv4InCidr('10.0.0.1', '10.0.0.0/33')).toThrow(CidrError);
    });
  });

  describe('isIPv6InCidr', () => {
    it('matches hosts inside an IPv6 CIDR', () => {
      expect(isIPv6InCidr('2001:db8::1', '2001:db8::/32')).toBe(true);
      expect(isIPv6InCidr('fe80::1', 'fe80::/10')).toBe(true);
    });

    it('rejects hosts outside an IPv6 CIDR', () => {
      expect(isIPv6InCidr('2001:db9::1', '2001:db8::/32')).toBe(false);
    });

    it('throws on malformed input', () => {
      expect(() => isIPv6InCidr('not-an-ipv6', '2001:db8::/32')).toThrow(CidrError);
      expect(() => isIPv6InCidr('2001:db8::1', '2001:db8::')).toThrow(CidrError);
    });
  });

  describe('parseTrustedProxyCidrs', () => {
    it('returns an empty list for undefined or empty input', () => {
      expect(parseTrustedProxyCidrs(undefined)).toEqual([]);
      expect(parseTrustedProxyCidrs('')).toEqual([]);
      expect(parseTrustedProxyCidrs('   ')).toEqual([]);
    });

    it('parses comma and whitespace separated lists', () => {
      expect(parseTrustedProxyCidrs('10.0.0.0/8, 192.168.0.0/16 2001:db8::/32')).toEqual([
        '10.0.0.0/8',
        '192.168.0.0/16',
        '2001:db8::/32',
      ]);
    });

    it('throws on malformed entries', () => {
      expect(() => parseTrustedProxyCidrs('not-a-cidr')).toThrow(CidrError);
    });
  });
});
