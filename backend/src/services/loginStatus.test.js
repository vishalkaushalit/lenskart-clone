import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { loggedInUserIds } from './loginStatus.js';

test('login status uses unexpired sessions and deduplicates valid user IDs', async (t) => {
  const id = '123456789012345678901234';
  t.mock.method(mongoose.connection, 'collection', (name) => {
    assert.equal(name, 'sessions');
    return { find(filter, options) {
      assert.ok(filter.expires.$gt instanceof Date);
      assert.deepEqual(options, { projection: { session: 1 } });
      return (async function* () {
        yield { session: JSON.stringify({ userId: id }) };
        yield { session: { userId: id } };
        yield { session: '{}' };
        yield { session: 'invalid json' };
        yield { session: JSON.stringify({ userId: 'invalid' }) };
      })();
    } };
  });
  assert.deepEqual((await loggedInUserIds()).map(String), [id]);
});

test('no logged-in sessions means no active user IDs', async (t) => {
  t.mock.method(mongoose.connection, 'collection', () => ({ find() { return (async function* () {})(); } }));
  assert.deepEqual(await loggedInUserIds(), []);
});
