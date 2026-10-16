const statuses = ['pending', 'confirmed', 'shipped', 'delivered'];
const couriers = ['Blue Dart', 'Delhivery', 'DTDC', 'Ecom Express'];

export function demoOrderHistory(order, index = 0) {
  const start = new Date(order.createdAt).getTime();
  const end = new Date(order.deliveredAt || order.updatedAt || order.createdAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) throw new Error('Invalid order date range.');
  const desired = order.status === 'cancelled' ? ['pending', 'cancelled'] : statuses.slice(0, statuses.indexOf(order.status) + 1);
  const history = [...(order.statusHistory || [])];
  const anchors = desired.map((status, position) => {
    const existing = history.find(event => event.status === status);
    const value = existing?.at || (status === 'pending' ? order.createdAt : status === 'delivered' ? order.deliveredAt : status === 'shipped' ? order.carrierCollectedAt : null);
    return value ? new Date(value).getTime() : position === desired.length - 1 ? end : null;
  });
  if (anchors[0] == null) anchors[0] = start;
  for (let position = 0; position < anchors.length; position++) {
    if (anchors[position] != null) continue;
    let right = position + 1;
    while (anchors[right] == null) right++;
    const left = position - 1;
    anchors[position] = anchors[left] + (anchors[right] - anchors[left]) / (right - left);
  }
  if (anchors.some((time, position) => !Number.isFinite(time) || (position > 0 && time < anchors[position - 1]))) throw new Error('Recorded timeline dates are inconsistent.');
  desired.forEach((status, position) => {
    if (!history.some(event => event.status === status)) history.push({ status, at: new Date(anchors[position]) });
  });
  const changes = {};
  if (history.length !== (order.statusHistory || []).length) changes.statusHistory = history.sort((a, b) => new Date(a.at) - new Date(b.at));
  if (!order.carrier) changes.carrier = couriers[index % couriers.length];
  const stageTime = status => history.find(event => event.status === status)?.at;
  if (order.status === 'delivered' && !order.deliveredAt) changes.deliveredAt = stageTime('delivered');
  if (order.trackingNumber) {
    if (!order.shipmentBookedAt) changes.shipmentBookedAt = new Date(order.carrierCollectedAt || stageTime('shipped') || stageTime('confirmed') || start);
    if (['shipped', 'delivered'].includes(order.status) && !order.carrierCollectedAt) changes.carrierCollectedAt = stageTime('shipped');
  }
  return changes;
}
