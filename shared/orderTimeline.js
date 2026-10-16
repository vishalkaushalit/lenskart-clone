const stages = [
  ['pending', 'Order placed', 'Your order has been received.'],
  ['confirmed', 'Confirmed', 'Your order is confirmed and being prepared.'],
  ['shipped', 'Shipped', 'Your order has been dispatched.'],
  ['delivered', 'Delivered', 'Your order has been delivered.'],
];

export function orderTimeline(order) {
  const history = order.statusHistory || [];
  const bookedOnly = Boolean(order.trackingNumber) && !order.carrierCollectedAt && !['delivered', 'cancelled'].includes(order.status);
  const effectiveStatus = bookedOnly && order.status === 'shipped' ? 'confirmed' : order.status;
  const index = stages.findIndex(([status]) => status === effectiveStatus);
  const cancelled = order.status === 'cancelled';
  const steps = stages.filter(([status]) => !cancelled || status === 'pending' || history.some(event => event.status === status));
  const result = steps.map(([status, label, description]) => {
    const event = history.find(event => event.status === status);
    const at = status === 'pending' ? order.createdAt : event?.at || (status === 'delivered' ? order.deliveredAt : null);
    const stageIndex = stages.findIndex(([value]) => value === status);
    return { status, label, description, at: at || null, complete: cancelled || stageIndex <= index, current: !cancelled && !bookedOnly && status === order.status };
  });
  const shipmentSteps = [];
  if (order.trackingNumber) shipmentSteps.push({ status: 'booked', label: 'Shipment booked', description: 'Your shipment has been booked', at: order.shipmentBookedAt || null, complete: true, current: bookedOnly });
  if (order.carrierCollectedAt) shipmentSteps.push({ status: 'collected', label: 'Collected by carrier', description: 'The carrier has collected your package.', at: order.carrierCollectedAt, complete: true, current: false });
  const shippedIndex = result.findIndex(step => step.status === 'shipped');
  result.splice(shippedIndex < 0 ? result.length : shippedIndex, 0, ...shipmentSteps);
  if (cancelled) result.push({ status: 'cancelled', label: 'Cancelled', description: 'This order has been cancelled.', at: history.find(event => event.status === 'cancelled')?.at || null, complete: true, current: true });
  return result;
}
