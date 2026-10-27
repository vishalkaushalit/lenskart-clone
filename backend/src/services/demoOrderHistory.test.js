import test from 'node:test';
import assert from 'node:assert/strict';
import { demoOrderHistory } from './demoOrderHistory.js';
const order = {
  status: 'delivered',
  createdAt: new Date('2026-10-01'),
  updatedAt: new Date('2026-10-06'),
  trackingNumber: '123',
};
test('demo backfill adds chronological history and courier without changing delivery eligibility', () => {
  const result = demoOrderHistory(order);
  assert.deepEqual(
    result.statusHistory.map((event) => event.status),
    ['pending', 'confirmed', 'shipped', 'delivered'],
  );
  assert.equal(result.deliveredAt.getTime(), order.updatedAt.getTime());
  assert.equal(result.carrier, 'Blue Dart');
  assert.equal(result.trackingNumber, undefined);
  assert.equal(result.status, undefined);
  assert.ok(result.carrierCollectedAt <= result.deliveredAt);
  assert.deepEqual(demoOrderHistory({ ...order, ...result }), {});
});
test('existing courier and timestamps are preserved and bookings do not invent pickup', () => {
  const confirmed = new Date('2026-10-02');
  const result = demoOrderHistory({
    ...order,
    carrier: 'Existing',
    status: 'confirmed',
    shipmentBookedAt: confirmed,
    statusHistory: [{ status: 'confirmed', at: confirmed }],
  });
  assert.equal(result.carrier, undefined);
  assert.equal(result.shipmentBookedAt, undefined);
  assert.equal(result.carrierCollectedAt, undefined);
  assert.equal(result.statusHistory.find((event) => event.status === 'confirmed').at, confirmed);
});
test('cancelled orders do not acquire delivered stages', () => {
  const result = demoOrderHistory({ ...order, status: 'cancelled', trackingNumber: '' });
  assert.deepEqual(
    result.statusHistory.map((event) => event.status),
    ['pending', 'cancelled'],
  );
  assert.equal(result.deliveredAt, undefined);
  assert.equal(result.carrierCollectedAt, undefined);
});
