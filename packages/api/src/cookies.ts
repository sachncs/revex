/**
 * Cookie helpers.
 *
 * Centralizes the `Set-Cookie` shape so the flags (HttpOnly,
 * Secure, SameSite, Path) are consistent across the auth surface.
 *
 * HttpOnly prevents client-side JavaScript from reading the
 * cookie, which closes the XSS-pivot that stole the workspace
 * passphrase via `document.cookie`.
 *
 * Secure (when `REVEX_PROFILE=production`) prevents the cookie
 * from riding plaintext HTTP. We do not default to Secure in
 * development because the local dev server is http.
 *
 * SameSite=Lax blocks most cross-site CSRF in modern browsers.
 * State-changing routes additionally enforce an Origin / Referer
 * match (see middleware/csrf.ts).
 */

import type { Context } from 'hono';

const isProduction = (): boolean =>
  process.env['REVEX_PROFILE'] === 'production' || process.env['NODE_ENV'] === 'production';

const baseFlags = (): string => {
  const flags = ['Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (isProduction()) flags.push('Secure');
  return flags.join('; ');
};

const setCookie = (c: Context, name: string, value: string, maxAgeSeconds: number): void => {
  const encoded = encodeURIComponent(value);
  const flags = baseFlags();
  c.header('Set-Cookie', `${name}=${encoded}; Max-Age=${maxAgeSeconds}; ${flags}`, {
    append: true,
  });
};

export const setSessionCookie = (c: Context, token: string, maxAgeSeconds = 86_400): void => {
  setCookie(c, 'revex_session', token, maxAgeSeconds);
};

export const setPassphraseCookie = (c: Context, passphrase: string, maxAgeSeconds = 86_400): void => {
  setCookie(c, 'revex_workspace_key', passphrase, maxAgeSeconds);
};

export const clearAuthCookies = (c: Context): void => {
  /* Always include Secure in the clearing flag set if the
   * issuance was Secure — most browsers reject a Secure-cleared
   * cookie over http otherwise. The Path and SameSite attributes
   * must match the issuance. */
  const flags = ['Path=/', 'HttpOnly', 'SameSite=Lax'];
  if (isProduction()) flags.push('Secure');
  const cookieAttrs = flags.join('; ');
  c.header('Set-Cookie', `revex_session=; Max-Age=0; ${cookieAttrs}`, { append: true });
  c.header('Set-Cookie', `revex_workspace_key=; Max-Age=0; ${cookieAttrs}`, { append: true });
};
