import { describe, expect, it } from 'vitest';

import { brandId, newId } from '../src/domain/ids.js';
import type {
  ChunkId,
  DocumentId,
  JobId,
  SessionId,
  UserId,
  WorkspaceId,
} from '../src/domain/ids.js';

describe('newId', () => {
  it('mints a string of the form <prefix>_<32 hex chars>', () => {
    const id = newId<UserId>('usr');
    expect(id).toMatch(/^usr_[0-9a-f]{32}$/);
  });

  it('every prefix returns a 128-bit hex suffix', () => {
    const a = newId<WorkspaceId>('wsp');
    const b = newId<DocumentId>('doc');
    const c = newId<ChunkId>('chk');
    const d = newId<SessionId>('sess');
    const e = newId<JobId>('job');
    for (const v of [a, b, c, d, e]) {
      const parts = v.split('_');
      expect(parts.length).toBe(2);
      const suffix = parts[1] ?? '';
      expect(suffix).toHaveLength(32);
      expect(/^[0-9a-f]{32}$/.test(suffix)).toBe(true);
    }
  });

  it('produces distinct values across 1k mints (collision-free at 128-bit entropy)', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 1_000; i += 1) {
      seen.add(newId<UserId>('usr'));
    }
    expect(seen.size).toBe(1_000);
  });

  it('matches brandId output (no extra wrapping)', () => {
    const raw = newId<UserId>('usr') as unknown as string;
    expect(brandId<UserId>(raw)).toBe(raw);
  });
});
