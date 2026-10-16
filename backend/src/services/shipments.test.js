import test from 'node:test';
import assert from 'node:assert/strict';
import { updateShipment } from './shipments.js';

test('generating a waybill books shipment without claiming collection', () => {
  const order = {}; const now = new Date();
  assert.equal(updateShipment(order, { trackingNumber: ' AWB123 ', carrier: 'Courier', status: 'confirmed' }, now), true);
  assert.equal(order.trackingNumber, 'AWB123'); assert.equal(order.shipmentBookedAt, now);
  assert.equal(order.carrierCollectedAt, undefined);
  assert.equal(updateShipment(order, { trackingNumber: 'AWB123', carrier: 'Courier', collected: false, status: 'confirmed' }), false);
});
test('collection is recorded once and required before shipping a booked parcel', () => {
  const order = { trackingNumber: 'AWB123', shipmentBookedAt: new Date() };
  assert.throws(() => updateShipment(order, { status: 'shipped' }), /collection/);
  const now = new Date();
  assert.equal(updateShipment(order, { collected: true, status: 'shipped' }, now), true);
  assert.equal(order.carrierCollectedAt, now);
  assert.equal(updateShipment(order, { collected: true, status: 'shipped' }), false);
  assert.throws(() => updateShipment(order, { trackingNumber: 'OTHER' }), /cannot be changed/);
  assert.throws(() => updateShipment(order, { collected: false }), /cannot be undone/);
});
test('shipment fields are validated and arbitrary timestamps cannot be injected', () => {
  for (const body of [{ trackingNumber: {} }, { carrier: 'x'.repeat(101) }, { trackingNumber: 'bad\nnumber' }, { collected: 'true' }, { collected: true }]) assert.throws(() => updateShipment({}, body));
  const order = {}; const now = new Date();
  updateShipment(order, { trackingNumber: '123', shipmentBookedAt: '1900-01-01', carrierCollectedAt: '1900-01-01' }, now);
  assert.equal(order.shipmentBookedAt, now); assert.equal(order.carrierCollectedAt, undefined);
});
