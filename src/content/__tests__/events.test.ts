import { describe, expect, it } from 'vitest';
import { CONTENT_VERSION } from '../contentVersion';
import { EVENT_POOL } from '../events';

describe('authored event catalogue', () => {
  it('keeps all 80 event templates unique and in stable authored order', () => {
    const ids = EVENT_POOL.map((event) => event.id);

    expect(ids).toHaveLength(80);
    expect(new Set(ids).size).toBe(80);
    expect(ids[0]).toBe('evt-competing-advisor');
    expect(ids.at(-1)).toBe('evt-key-advisor-falls-ill');
  });

  it('has an explicit content version for deterministic saves', () => {
    expect(CONTENT_VERSION).toBe('solara-events-v2');
  });
});
