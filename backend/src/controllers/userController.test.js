import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import mongoose from 'mongoose';

test.beforeEach((t) => {
  t.mock.method(mongoose.connection, 'collection', () => ({ find() { return (async function* () {})(); } }));
});
import { listUsers, createUser, editUser } from './userController.js';
import userRoutes from '../routes/userRoutes.js';
import { requireAuth } from '../middleware/auth.js';

function response() {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function mockUsers(t, users, total, expectedSkip, expectedLimit) {
  const query = {
    collation(options) { assert.deepEqual(options, { locale: 'en', strength: 2 }); return this; },
    select(fields) { assert.equal(fields, '_id userId name email phone status role createdAt updatedAt'); return this; },
    sort(order) { assert.deepEqual(order, { createdAt: -1, _id: -1 }); return this; },
    skip(count) { assert.equal(count, expectedSkip); return this; },
    limit(count) { assert.equal(count, expectedLimit); return this; },
    async lean() { return users; },
  };
  t.mock.method(User, 'find', (filter) => { assert.deepEqual(filter, {}); return query; });
  t.mock.method(User, 'countDocuments', async (filter) => { return filter._id ? 0 : total; });
}

test('users list defaults to page 1 with only public account fields', async (t) => {
  const user = { _id: 'user-1', userId: undefined, name: 'Customer', email: 'customer@example.com', role: 'customer', createdAt: 'created', updatedAt: 'updated', passwordHash: 'private', secret: 'private' };
  mockUsers(t, [user], 1, 0, 20);
  const res = response();
  await listUsers({ query: {} }, res, assert.ifError);
  assert.deepEqual(res.body, {
    success: true,
    users: [{ id: 'user-1', userId: undefined, name: 'Customer', email: 'customer@example.com', role: 'customer', phone: '', status: 'inactive', accountStatus: 'active', createdAt: 'created', updatedAt: 'updated' }],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
    counts: { all: 1, active: 0, inactive: 1 },
  });
});

test('custom pagination returns the correct offset and page count', async (t) => {
  mockUsers(t, [], 25, 10, 10);
  const res = response();
  await listUsers({ query: { page: '2', limit: '10' } }, res, assert.ifError);
  assert.deepEqual(res.body.pagination, { page: 2, limit: 10, total: 25, totalPages: 3 });
});

test('an empty users collection returns an empty list', async (t) => {
  mockUsers(t, [], 0, 0, 20);
  const res = response();
  await listUsers({ query: {} }, res, assert.ifError);
  assert.deepEqual(res.body.users, []);
  assert.equal(res.body.pagination.totalPages, 0);
});

test('invalid pagination is rejected before querying the database', async (t) => {
  t.mock.method(User, 'find', () => assert.fail('unexpected database query'));
  for (const query of [
    { page: '0' }, { page: '-1' }, { page: '1.5' }, { page: '10001' },
    { page: 'abc' }, { page: '' }, { page: ['1', '2'] }, { page: { $gt: '1' } },
    { limit: '0' }, { limit: '101' }, { limit: '1.5' }, { limit: 'Infinity' },
  ]) {
    const res = response();
    await listUsers({ query }, res, assert.ifError);
    assert.equal(res.statusCode, 400);
  }
});

test('users route blocks guests and non-admin accounts', async () => {
  const route = userRoutes.stack[0].route;
  assert.equal(route.path, '/');
  assert.equal(route.methods.get, true);
  assert.equal(route.stack[0].handle, requireAuth);
  assert.equal(route.stack[2].handle, listUsers);
  const guest = response();
  await route.stack[0].handle({ session: {} }, guest, () => assert.fail('guest passed'));
  assert.equal(guest.statusCode, 401);
  const customer = response();
  route.stack[1].handle({ user: { role: 'customer' } }, customer, () => assert.fail('customer passed'));
  assert.equal(customer.statusCode, 403);
  let allowed = false;
  route.stack[1].handle({ user: { role: 'admin' } }, response(), () => { allowed = true; });
  assert.equal(allowed, true);
});

test('database failures are forwarded to the error handler', async (t) => {
  const failure = new Error('database unavailable');
  t.mock.method(User, 'find', () => { throw failure; });
  let received;
  await listUsers({ query: {} }, response(), (error) => { received = error; });
  assert.equal(received, failure);
});


test('invalid search and status cannot query MongoDB', async (t) => {
  t.mock.method(User, 'find', () => assert.fail('unexpected query'));
  for (const query of [{ search: { $ne: '' } }, { search: 'x'.repeat(101) }, { status: 'unknown' }, { status: ['active'] }]) {
    const res = response();
    await listUsers({ query }, res, assert.ifError);
    assert.equal(res.statusCode, 400);
  }
});

test('search uses literal text and status filters with global counts', async (t) => {
  const expected = { $or: ['name', 'email', 'phone'].map((field) => ({ [field]: { $regex: 'a\\.b', $options: 'i' } })), $nor: [{ _id: { $in: [] }, status: { $ne: 'inactive' } }] };
  const query = { collation() { return this; }, select() { return this; }, sort() { return this; }, skip() { return this; }, limit() { return this; }, async lean() { return []; } };
  t.mock.method(User, 'find', (filter) => { assert.deepEqual(filter, expected); return query; });
  let call = 0;
  t.mock.method(User, 'countDocuments', async (filter) => { assert.deepEqual(filter, [expected, {}, { _id: { $in: [] }, status: { $ne: 'inactive' } }][call]); return [0, 10, 3][call++]; });
  const res = response();
  await listUsers({ query: { search: 'a.b', status: 'inactive' } }, res, assert.ifError);
  assert.deepEqual(res.body.counts, { all: 10, active: 3, inactive: 7 });
  assert.equal(res.body.pagination.total, 0);
});


test('invalid new accounts are rejected before creation', async (t) => {
  t.mock.method(User, 'create', () => assert.fail('unexpected account creation'));
  const res = response();
  await createUser({ body: { name: 'Test', email: 'test@example.com', password: 'short' } }, res, assert.ifError);
  assert.equal(res.statusCode, 400);
});

test('admins cannot deactivate their own account', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', () => assert.fail('unexpected update'));
  const id = '123456789012345678901234';
  const res = response();
  await editUser({ params: { id }, user: { _id: id }, body: { status: 'inactive' } }, res, assert.ifError);
  assert.equal(res.statusCode, 403);
});


test('name and date sorting are applied before pagination', async (t) => {
  for (const [sort, order] of Object.entries({ 'name-asc': { name: 1, _id: 1 }, 'name-desc': { name: -1, _id: -1 }, oldest: { createdAt: 1, _id: 1 }, newest: { createdAt: -1, _id: -1 } })) {
    const calls = [];
    const query = {
      select() { return this; },
      collation(options) { assert.equal(options.strength, 2); return this; },
      sort(actual) { assert.deepEqual(actual, order); calls.push('sort'); return this; },
      skip() { calls.push('skip'); return this; },
      limit() { calls.push('limit'); return this; },
      async lean() { return []; },
    };
    t.mock.method(User, 'find', () => query);
    t.mock.method(User, 'countDocuments', async () => 0);
    const res = response();
    await listUsers({ query: { sort } }, res, assert.ifError);
    assert.deepEqual(calls, ['sort', 'skip', 'limit']);
  }
});

test('unsupported and non-string sort orders are rejected', async (t) => {
  t.mock.method(User, 'find', () => assert.fail('unexpected query'));
  for (const sort of ['unknown', 'toString', { name: 1 }, ['newest']]) {
    const res = response();
    await listUsers({ query: { sort } }, res, assert.ifError);
    assert.equal(res.statusCode, 400);
  }
});
