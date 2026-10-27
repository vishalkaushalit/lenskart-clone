import test from 'node:test';
import assert from 'node:assert/strict';
import { recordOrderStatus } from './orderTracking.js';
import Order from '../models/Order.js';

test('new orders record initial status and later fulfillment changes record server time', () => {
  const now = new Date('2026-10-16T08:00:00Z');
  const order = { isNew: true, status: 'confirmed', statusHistory: [], isModified: () => false };
  recordOrderStatus(order, now);
  assert.deepEqual(order.statusHistory, [{ status: 'confirmed', at: now }]);
  order.isNew = false;
  recordOrderStatus(order, now);
  assert.equal(order.statusHistory.length, 1);
  order.status = 'shipped';
  order.isModified = (path) => path === 'status';
  recordOrderStatus(order, now);
  assert.equal(order.statusHistory[1].status, 'shipped');
  order.status = 'delivered';
  order.deliveredAt = new Date('2026-10-17T08:00:00Z');
  recordOrderStatus(order, now);
  assert.equal(order.statusHistory[2].at, order.deliveredAt);
});
test('order history validates timestamps and statuses', async () => {
  const fields = { user: '123456789012345678901234', items: [], totalAmount: 0 };
  await new Order({ ...fields, statusHistory: [{ status: 'shipped', at: new Date() }] }).validate();
  for (const event of [
    { status: 'invalid', at: new Date() },
    { status: 'shipped' },
    { status: 'shipped', at: 'invalid' },
  ]) {
    await assert.rejects(new Order({ ...fields, statusHistory: [event] }).validate());
  }
});
