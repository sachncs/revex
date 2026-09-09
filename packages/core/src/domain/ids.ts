/**
 * Branded identifier types.
 *
 * `string`-shaped at runtime (zero-cost) so they pass through JSON
 * unchanged, but nominal at compile time so a `UserId` cannot be
 * silently passed where a `WorkspaceId` is expected.
 */

declare const brand: unique symbol;

export type Brand<TBase, TName extends string> = TBase & {
  readonly [brand]: TName;
};

export type WorkspaceId = Brand<string, 'WorkspaceId'>;
export type UserId = Brand<string, 'UserId'>;
export type CollectionId = Brand<string, 'CollectionId'>;
export type DocumentId = Brand<string, 'DocumentId'>;
export type ChunkId = Brand<string, 'ChunkId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type TraceId = Brand<string, 'TraceId'>;
export type JobId = Brand<string, 'JobId'>;

/**
 * Mint a branded ID from an unbranded string.
 *
 * Use only at the trust boundary (database row reads, JWT claims,
 * user input). Domain code should treat branded IDs as opaque.
 */
export const brandId = <T extends Brand<string, string>>(raw: string): T => raw as T;

/**
 * `crypto`-backed 128 bits of entropy, hex-encoded (32 chars).
 *
 * Some runtimes expose `globalThis.crypto.randomUUID()` only
 * behind `--experimental-global-webcrypto`; we tolerate that
 * by also accepting `node:crypto.webcrypto.randomUUID`. We
 * never fall back to `Math.random()` — if neither is available
 * the function throws and the caller must surface the error.
 */
const hex128 = (): string => {
  const c: Crypto | undefined =
    typeof globalThis.crypto !== 'undefined'
      ? (globalThis.crypto as Crypto)
      : undefined;
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID().replace(/-/g, '');
  }
  throw new Error('crypto.randomUUID is unavailable; refuse to mint insecure IDs');
};

/**
 * Mint a fresh identifier of the form `<prefix>_<128-bit hex>`.
 *
 * Every workspace, user, job, group, webhook, feedback, session,
 * trace, and document ID in the system is produced through this
 * helper. Callers should pass the appropriate prefix
 * (`wsp`, `usr`, `job`, `grp`, `wh`, `fb`, etc.) so log and audit
 * output stays greppable.
 *
 * Use `newId` only at the trust boundary (storage write, route
 * handler mint, request admission). Domain code should treat
 * branded IDs as opaque.
 */
export const newId = <T extends Brand<string, string>>(prefix: string): T => {
  return brandId<T>(`${prefix}_${hex128()}`);
};