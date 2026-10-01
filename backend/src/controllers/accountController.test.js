import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { updateProfile, listOrders } from './accountController.js';
import accountRoutes from '../routes/accountRoutes.js';
import { requireAuth } from '../middleware/auth.js';

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('profile updates use the session account and allow only name and email', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', async (id, update, options) => {
    assert.equal(id, 'session-user');
    assert.deepEqual(update, { $set: { name: 'Customer', email: 'customer@example.com' } });
    assert.deepEqual(options, { new: true, runValidators: true });
    return { _id: id, ...update.$set, role: 'customer', passwordHash: 'private' };
  });
  const res = response();
  await updateProfile({ user: { _id: 'session-user' }, body: {
    name: ' Customer ', email: ' CUSTOMER@example.com ',
    id: 'another-user', role: 'admin', passwordHash: 'injected',
  } }, res, assert.ifError);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.user, {
    id: 'session-user', name: 'Customer', email: 'customer@example.com', role: 'customer',
  });
});

test('invalid profile fields never reach the database', async (t) => {
  const update = t.mock.method(User, 'findByIdAndUpdate', () => assert.fail('unexpected database update'));
  for (const body of [
    {}, { name: {}, email: 'test@example.com' },
    { name: ' ', email: 'test@example.com' },
    { name: 'a'.repeat(101), email: 'test@example.com' },
    { name: 'Customer', email: 'invalid' },
  ]) {
    const res = response();
    await updateProfile({ user: { _id: 'session-user' }, body }, res, assert.ifError);
    assert.equal(res.statusCode, 400);
  }
  assert.equal(update.mock.callCount(), 0);
});

test('duplicate emails return a useful conflict response', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); });
  const res = response();
  await updateProfile({ user: { _id: 'session-user' }, body: { name: 'Customer', email: 'used@example.com' } }, res, assert.ifError);
  assert.equal(res.statusCode, 409);
  assert.match(res.body.message, /already exists/);
});

test('order history is scoped to the session user and paginated newest first', async (t) => {
  const orders = Array.from({ length: 11 }, (_, index) => ({ _id: String(index) }));
  const query = {
    select(fields) { assert.equal(fields, 'items totalAmount currency status createdAt'); return this; },
    sort(order) { assert.deepEqual(order, { createdAt: -1, _id: -1 }); return this; },
    skip(count) { assert.equal(count, 10); return this; },
    limit(count) { assert.equal(count, 11); return this; },
    async lean() { return orders; },
  };
  t.mock.method(Order, 'find', (filter) => {
    assert.deepEqual(filter, { user: 'session-user' });
    return query;
  });
  const res = response();
  await listOrders({ user: { _id: 'session-user' }, query: { page: '2', user: 'another-user' } }, res, assert.ifError);
  assert.equal(res.body.orders.length, 10);
  assert.equal(res.body.page, 2);
  assert.equal(res.body.hasMore, true);
});

test('invalid order pagination is rejected before querying', async (t) => {
  t.mock.method(Order, 'find', () => assert.fail('unexpected database query'));
  for (const page of ['0', '-1', '1.5', 'abc', '10001']) {
    const res = response();
    await listOrders({ user: { _id: 'session-user' }, query: { page } }, res, assert.ifError);
    assert.equal(res.statusCode, 400);
  }
});

test('an account with no orders receives an empty history', async (t) => {
  const query = {
    select() { return this; }, sort() { return this; },
    skip() { return this; }, limit() { return this; },
    async lean() { return []; },
  };
  t.mock.method(Order, 'find', () => query);
  const res = response();
  await listOrders({ user: { _id: 'session-user' }, query: {} }, res, assert.ifError);
  assert.deepEqual(res.body, { success: true, orders: [], page: 1, hasMore: false });
});

test('an account removed before saving returns unauthorized', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', async () => null);
  const res = response();
  await updateProfile({ user: { _id: 'session-user' }, body: { name: 'Customer', email: 'test@example.com' } }, res, assert.ifError);
  assert.equal(res.statusCode, 401);
});

test('both account endpoints require an authenticated session', async () => {
  assert.equal(accountRoutes.stack[0].handle, requireAuth);
  const res = response();
  await requireAuth({ session: {} }, res, () => assert.fail('unauthenticated request passed'));
  assert.equal(res.statusCode, 401);
});

test('database failures pass to the error handler', async (t) => {
  const failure = new Error('database unavailable');
  t.mock.method(User, 'findByIdAndUpdate', async () => { throw failure; });
  let received;
  await updateProfile({ user: { _id: 'session-user' }, body: { name: 'Customer', email: 'test@example.com' } }, response(), (error) => { received = error; });
  assert.equal(received, failure);
});
