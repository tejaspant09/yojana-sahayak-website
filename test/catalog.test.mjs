import test from 'node:test';
import assert from 'node:assert/strict';
import { filterCurrentCatalog } from '../client/catalog.mjs';

test('an already open static site removes expired facts using India calendar dates', () => {
  const catalog = {
    schemes: [{ id: 'fictional' }],
    records: [
      { id: 'expired', source: { valid_until: '2026-10-30' } },
      { id: 'today', source: { valid_until: '2026-10-31' } },
      { id: 'unbounded', source: { valid_until: null } }
    ]
  };
  assert.deepEqual(filterCurrentCatalog(catalog, new Date('2026-10-31T12:00:00Z')).records.map(r => r.id), ['today', 'unbounded']);
  assert.deepEqual(filterCurrentCatalog(catalog, new Date('2026-10-31T18:30:00Z')).records.map(r => r.id), ['unbounded']);
  assert.equal(catalog.records.length, 3);
});

test('missing or malformed expiry metadata cannot silently publish a record', () => {
  assert.throws(() => filterCurrentCatalog({ records: [{ source: {} }] }));
  assert.throws(() => filterCurrentCatalog({ records: [{ source: { valid_until: 'later' } }] }));
});
