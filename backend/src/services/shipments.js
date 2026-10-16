function invalid(message) { throw Object.assign(new Error(message), { status: 400 }); }

export function updateShipment(order, body, now = new Date()) {
  let changed = false;
  for (const field of ['trackingNumber', 'carrier']) {
    if (!Object.hasOwn(body, field)) continue;
    if (typeof body[field] !== 'string' || body[field].trim().length > 100 || /[\r\n\x00-\x1f]/.test(body[field])) invalid('Enter a valid carrier and waybill/tracking number (up to 100 characters each).');
    const value = body[field].trim();
    if ((order[field] || '') !== value) {
      if (order.carrierCollectedAt) invalid('Shipment details cannot be changed after carrier collection.');
      order[field] = value; changed = true;
    }
  }
  if (Object.hasOwn(body, 'collected') && typeof body.collected !== 'boolean') invalid('Carrier collection must be true or false.');
  if (order.trackingNumber && !order.shipmentBookedAt) { order.shipmentBookedAt = now; changed = true; }
  if (!order.trackingNumber && order.shipmentBookedAt && !order.carrierCollectedAt) { order.shipmentBookedAt = null; changed = true; }
  if (body.collected === true && !order.carrierCollectedAt) {
    if (!order.trackingNumber) invalid('Enter the waybill/tracking number before recording carrier collection.');
    order.carrierCollectedAt = now; changed = true;
  }
  if (body.collected === false && order.carrierCollectedAt) invalid('Recorded carrier collection cannot be undone.');
  if (order.trackingNumber && ['shipped', 'delivered'].includes(body.status) && !order.carrierCollectedAt) invalid('Confirm carrier collection before marking a booked shipment shipped or delivered.');
  return changed;
}
