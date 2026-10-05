import test from 'node:test';
import assert from 'node:assert/strict';
import Counter from '../models/Counter.js';
import User from '../models/User.js';
import { nextUserId, initializeUserIds } from './userIds.js';

function usersCollection(users) {
  return {
    find(filter, options) {
      assert.deepEqual(options.projection, { _id: 1, userId: 1 });
      return { sort(order) {
        assert.deepEqual(order, { createdAt: 1, _id: 1 });
        return (async function* () { yield* users; })();
      } };
    },
    async updateOne(filter, update) {
      const user = users.find((entry) => entry._id === filter._id);
      if ('userId' in filter ? user.userId !== filter.userId : user.userId != null) return { modifiedCount: 0 };
      user.userId = update.$set.userId;
      return { modifiedCount: 1 };
    },
    async createIndex(fields, options) {
      assert.deepEqual(fields, { userId: 1 });
      assert.deepEqual(options, { unique: true, sparse: true });
    },
  };
}

function counter(t, initial = 0) {
  let value = initial;
  t.mock.method(Counter, 'findOneAndUpdate', async (filter, update) => {
    assert.deepEqual(filter, { _id: 'users.userId' });
    assert.deepEqual(update, { $inc: { value: 1 } });
    return { value: ++value };
  });
  t.mock.method(Counter, 'updateOne', async (filter, update) => {
    value = Math.max(value, update.$max.value);
  });
}

test('concurrent allocations use an atomic increment and receive unique IDs', async (t) => {
  counter(t);
  assert.deepEqual(await Promise.all(Array.from({ length: 20 }, () => nextUserId())), Array.from({ length: 20 }, (_, i) => i + 1));
});

test('a counter creation race retries without inserting a duplicate counter', async (t) => {
  let calls = 0;
  t.mock.method(Counter, 'findOneAndUpdate', async (filter, update, options) => {
    if (++calls === 1) throw Object.assign(new Error('duplicate'), { code: 11000 });
    assert.equal(options.upsert, undefined);
    return { value: 2 };
  });
  assert.equal(await nextUserId(), 2);
});

test('backfill starts at 1 and is safe to rerun', async (t) => {
  counter(t);
  const users = [{ _id: 'oldest' }, { _id: 'newest' }];
  const collection = usersCollection(users);
  assert.equal((await initializeUserIds(collection)).assigned, 2);
  assert.deepEqual(users.map((user) => user.userId), [1, 2]);
  assert.equal((await initializeUserIds(collection)).assigned, 0);
  assert.equal(await nextUserId(), 3);
});

test('existing IDs and a higher historical counter are preserved', async (t) => {
  counter(t, 10);
  const users = [{ _id: 'existing', userId: 4 }, { _id: 'missing' }];
  await initializeUserIds(usersCollection(users));
  assert.deepEqual(users.map((user) => user.userId), [4, 11]);
  assert.equal(await nextUserId(), 12);
});

test('dry run performs no writes', async (t) => {
  t.mock.method(Counter, 'updateOne', () => assert.fail('unexpected write'));
  const users = [{ _id: 'missing' }];
  const summary = await initializeUserIds(usersCollection(users), { dryRun: true });
  assert.equal(summary.usersWithoutId, 1);
  assert.equal(users[0].userId, undefined);
});

test('duplicate or invalid existing IDs fail before migration writes', async (t) => {
  t.mock.method(Counter, 'updateOne', () => assert.fail('unexpected write'));
  for (const values of [[1, 1], [1, '1'], [0], [-1], [1.5], ['01'], ['abc']]) {
    await assert.rejects(initializeUserIds(usersCollection(values.map((userId, i) => ({ _id: i, userId })))), /unique positive integers/);
  }
});

test('legacy text IDs become numbers and keep their existing identity', async (t) => {
  counter(t);
  const users = [{ _id: 'legacy', userId: '1' }, { _id: 'existing', userId: 2 }, { _id: 'missing' }];
  const collection = usersCollection(users);
  await initializeUserIds(collection, { dryRun: true });
  assert.equal(users[0].userId, '1');
  await initializeUserIds(collection);
  assert.deepEqual(users.map((user) => user.userId), [1, 2, 3]);
  assert.equal((await initializeUserIds(collection)).assigned, 0);
});

test('new saves override supplied IDs once and existing saves do not allocate', async (t) => {
  counter(t);
  const hook = User.schema.s.hooks._pres.get('save').find((entry) => entry.fn.toString().includes('userIdAssigned')).fn;
  const user = new User({ name: 'Test', email: 'test@example.com', passwordHash: 'hash', userId: 99 });
  await hook.call(user);
  assert.equal(user.userId, 1);
  await hook.call(user);
  assert.equal(user.userId, 1);
  await hook.call({ isNew: false });
  assert.equal(await nextUserId(), 2);
});

test('insertMany assigns IDs through the same counter', async (t) => {
  counter(t, 2);
  const hook = User.schema.s.hooks._pres.get('insertMany')[0].fn;
  const users = [{ userId: 100 }, {}];
  await hook.call(User, users);
  assert.deepEqual(users.map((user) => user.userId), [3, 4]);
});
