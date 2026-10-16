import test from 'node:test';
import assert from 'node:assert/strict';
import { readSavedTryOn, saveTryOn, savedTryOnKey } from './savedTryOn.js';
test('fit reference persists and rejects invalid records or unavailable storage', () => {
  const values = new Map();
  const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
  const fit = { name: 'Frame', size: 'M', widthMm: 133.5, scale: 1, date: '2026-10-16T12:00:00Z', snapshot: 'data:image/jpeg;base64,AA==' };
  saveTryOn(storage, fit);
  assert.deepEqual(readSavedTryOn(storage), fit);
  saveTryOn(storage, { ...fit, name: 'Another frame', widthMm: 124.5 });
  assert.equal(readSavedTryOn(storage).name, 'Another frame');
  for (const invalid of [{ ...fit, widthMm: -1 }, { ...fit, snapshot: 'https://example.com/photo' }, { ...fit, scale: 4 }]) {
    saveTryOn(storage, invalid); assert.equal(readSavedTryOn(storage), null);
  }
  values.set(savedTryOnKey, '{'); assert.equal(readSavedTryOn(storage), null);
  assert.equal(readSavedTryOn({ getItem() { throw new Error('blocked'); } }), null);
  assert.throws(() => saveTryOn({ setItem() { throw new Error('full'); } }, fit));
});
