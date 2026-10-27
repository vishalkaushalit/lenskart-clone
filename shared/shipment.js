export function shipmentMessage(order) {
  if (order.status === 'cancelled') return 'Your order has been cancelled.';
  if (order.status === 'delivered') return 'Your shipment has been delivered.';
  if (order.trackingNumber && !order.carrierCollectedAt) return 'Your shipment has been booked';
  if (order.carrierCollectedAt || order.status === 'shipped')
    return 'Your shipment has been dispatched.';
  return '';
}
