import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import { editUser, deleteUser } from './userController.js';
import userRoutes from '../routes/userRoutes.js';
import { requireAuth } from '../middleware/auth.js';

const adminId = 'aaaaaaaaaaaaaaaaaaaaaaaa';
const targetId = 'bbbbbbbbbbbbbbbbbbbbbbbb';
const request = (body = {}, id = targetId) => ({ params: { id }, user: { _id: adminId, role: 'admin' }, body });
const response = () => ({
  statusCode: 200,
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; return this; },
});

test('editing normalizes fields, ignores private fields, and returns public data', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', async (id, update, options) => {
    assert.equal(id, targetId);
    assert.deepEqual(update, { $set: { name: 'Customer', email: 'customer@example.com', role: 'admin' } });
    assert.deepEqual(options, { new: true, runValidators: true });
    return { _id: id, ...update.$set, passwordHash: 'secret' };
  });
  const res = response();
  await editUser(request({ name: ' Customer ', email: 'CUSTOMER@example.com ', role: 'admin', passwordHash: 'injected' }), res, assert.ifError);
  assert.equal(res.body.user.id, targetId);
  assert.equal(res.body.user.role, 'admin');
  assert.equal(Object.hasOwn(res.body.user, 'passwordHash'), false);
});

test('invalid IDs and fields are rejected before accessing the database', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', () => assert.fail('unexpected update'));
  t.mock.method(User, 'findByIdAndDelete', () => assert.fail('unexpected delete'));
  for (const body of [{}, { name: '' }, { name: {} }, { name: 'a'.repeat(101) }, { email: 'invalid' }, { role: 'owner' }, { passwordHash: 'only-private' }]) {
    const res = response();
    await editUser(request(body), res, assert.ifError);
    assert.equal(res.statusCode, 400);
  }
  for (const handler of [editUser, deleteUser]) {
    const res = response();
    await handler(request({ name: 'User' }, 'invalid'), res, assert.ifError);
    assert.equal(res.statusCode, 400);
  }
});

test('admins cannot delete themselves or remove their own admin role', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', () => assert.fail('unexpected update'));
  t.mock.method(User, 'findByIdAndDelete', () => assert.fail('unexpected delete'));
  for (const id of [adminId, adminId.toUpperCase()]) {
    const edit = response();
    await editUser(request({ role: 'customer' }, id), edit, assert.ifError);
    assert.equal(edit.statusCode, 403);
    const deletion = response();
    await deleteUser(request({}, id), deletion, assert.ifError);
    assert.equal(deletion.statusCode, 403);
  }
});

test('duplicate email conflicts return 409', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); });
  const res = response();
  await editUser(request({ email: 'used@example.com' }), res, assert.ifError);
  assert.equal(res.statusCode, 409);
});

test('deleting removes only the requested user', async (t) => {
  t.mock.method(User, 'findByIdAndDelete', async (id) => {
    assert.equal(id, targetId);
    return { _id: id };
  });
  const res = response();
  await deleteUser(request(), res, assert.ifError);
  assert.equal(res.body.success, true);
});

test('missing users return 404 for editing and deleting', async (t) => {
  t.mock.method(User, 'findByIdAndUpdate', async () => null);
  t.mock.method(User, 'findByIdAndDelete', async () => null);
  for (const handler of [editUser, deleteUser]) {
    const res = response();
    await handler(request({ name: 'Customer' }), res, assert.ifError);
    assert.equal(res.statusCode, 404);
  }
});

test('both mutation routes require authentication and the admin role', () => {
  for (const [method, handler] of [['patch', editUser], ['delete', deleteUser]]) {
    const route = userRoutes.stack.find((layer) => layer.route?.methods[method]).route;
    assert.equal(route.path, '/:id');
    assert.equal(route.stack[0].handle, requireAuth);
    assert.equal(route.stack[2].handle, handler);
    const res = response();
    route.stack[1].handle({ user: { role: 'customer' } }, res, () => assert.fail('customer passed'));
    assert.equal(res.statusCode, 403);
  }
});

test('unexpected database errors are forwarded', async (t) => {
  const failure = new Error('database unavailable');
  t.mock.method(User, 'findByIdAndDelete', async () => { throw failure; });
  let received;
  await deleteUser(request(), response(), (error) => { received = error; });
  assert.equal(received, failure);
});
