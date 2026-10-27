import test from 'node:test';
import assert from 'node:assert/strict';
import { hasSessionHint, rememberSession, sessionHintKey } from '../../../shared/sessionHint.js';
function mockStorage(t, value) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value,
  });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'localStorage', previous);
    else delete globalThis.localStorage;
  });
}
test('session hints are non-sensitive login flags that clear after logout', (t) => {
  const values = new Map();
  mockStorage(t, {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  });
  assert.equal(hasSessionHint(), false);
  rememberSession(true);
  assert.equal(values.get(sessionHintKey), '1');
  assert.equal(hasSessionHint(), true);
  rememberSession(false);
  assert.equal(hasSessionHint(), false);
});
test('unavailable browser storage falls back to cookie validation without crashing', (t) => {
  mockStorage(t, {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
    removeItem() {
      throw new Error('blocked');
    },
  });
  assert.equal(hasSessionHint(), true);
  assert.doesNotThrow(() => rememberSession(true));
  assert.doesNotThrow(() => rememberSession(false));
});
