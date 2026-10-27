import test from 'node:test';
import assert from 'node:assert/strict';
import { orderTimeline } from './orderTimeline.js';

test('tracking shows completed, current and upcoming stages for each fulfillment status', () => {
  for (const [index, status] of ['pending', 'confirmed', 'shipped', 'delivered'].entries()) {
    const steps = orderTimeline({ status, createdAt: '2026-01-01' });
    assert.equal(steps.length, 4);
    assert.equal(steps.filter((step) => step.complete).length, index + 1);
    assert.equal(steps.filter((step) => step.current)[0].status, status);
  }
});
test('timeline uses recorded timestamps and does not invent dates for legacy skipped stages', () => {
  const steps = orderTimeline({
    status: 'delivered',
    createdAt: '2026-01-01',
    deliveredAt: '2026-01-04',
    statusHistory: [{ status: 'shipped', at: '2026-01-03' }],
  });
  assert.equal(steps[0].at, '2026-01-01');
  assert.equal(steps[1].at, null);
  assert.equal(steps[2].at, '2026-01-03');
  assert.equal(steps[3].at, '2026-01-04');
});
test('cancelled orders show recorded progress and cancellation without future delivery stages', () => {
  const steps = orderTimeline({
    status: 'cancelled',
    createdAt: '2026-01-01',
    statusHistory: [
      { status: 'confirmed', at: '2026-01-01' },
      { status: 'cancelled', at: '2026-01-02' },
    ],
  });
  assert.deepEqual(
    steps.map((step) => step.status),
    ['pending', 'confirmed', 'cancelled'],
  );
  assert.equal(steps[2].at, '2026-01-02');
  assert.equal(steps[2].current, true);
  assert.equal(orderTimeline({ status: 'cancelled' }).at(-1).at, null);
});
test('waybill generation is booked and does not imply dispatch before collection', () => {
  const steps = orderTimeline({
    status: 'shipped',
    trackingNumber: 'AWB123',
    shipmentBookedAt: '2026-01-02',
  });
  assert.equal(steps.find((step) => step.status === 'shipped').complete, false);
  assert.equal(steps.find((step) => step.current).status, 'booked');
  assert.equal(
    steps.find((step) => step.status === 'booked').description,
    'Your shipment has been booked',
  );
});
test('shipment timeline includes actual booking and collection dates', () => {
  const steps = orderTimeline({
    status: 'shipped',
    trackingNumber: '123',
    shipmentBookedAt: '2026-01-02',
    carrierCollectedAt: '2026-01-03',
  });
  assert.deepEqual(
    steps.map((step) => step.status),
    ['pending', 'confirmed', 'booked', 'collected', 'shipped', 'delivered'],
  );
  assert.equal(steps.find((step) => step.status === 'collected').at, '2026-01-03');
});
