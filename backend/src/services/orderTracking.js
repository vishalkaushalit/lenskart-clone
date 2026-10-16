export function recordOrderStatus(order, now = new Date()) {
  if (order.isNew || order.isModified('status')) {
    order.statusHistory.push({ status: order.status, at: order.status === 'delivered' && order.deliveredAt ? order.deliveredAt : now });
  }
}
