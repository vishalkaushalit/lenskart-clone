import test from 'node:test';
import assert from 'node:assert/strict';
import { shipmentMessage } from './shipment.js';
test('shipment copy distinguishes booking, dispatch, delivery and cancellation', () => {
  assert.equal(
    shipmentMessage({ trackingNumber: '123', status: 'confirmed' }),
    'Your shipment has been booked',
  );
  assert.equal(
    shipmentMessage({ trackingNumber: '123', status: 'shipped' }),
    'Your shipment has been booked',
  );
  assert.match(
    shipmentMessage({ trackingNumber: '123', carrierCollectedAt: '2026-01-02', status: 'shipped' }),
    /dispatched/,
  );
  assert.match(shipmentMessage({ trackingNumber: '123', status: 'cancelled' }), /cancelled/);
  assert.match(shipmentMessage({ trackingNumber: '123', status: 'delivered' }), /delivered/);
});
