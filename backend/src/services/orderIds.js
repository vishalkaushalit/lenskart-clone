import Counter from '../models/Counter.js';

const counterId = 'orders.orderId';

export async function nextOrderId(session) {
  let counter;
  try {
    counter = await Counter.findOneAndUpdate(
      { _id: counterId }, { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: false, ...(session?{session}:{}) },
    );
  } catch (error) {
    // Concurrent first allocations can race to create the counter document.
    if (error.code !== 11000) throw error;
    counter = await Counter.findOneAndUpdate(
      { _id: counterId }, { $inc: { value: 1 } }, { new: true, ...(session?{session}:{}) },
    );
  }
  if (!counter || !Number.isSafeInteger(counter.value) || counter.value < 1) {
    throw new Error('Unable to allocate a valid orderId.');
  }
  return counter.value;
}

export async function initializeOrderIds(orders, { dryRun = false } = {}) {
  const seen = new Set();
  const missing = [];
  const conversions = [];
  let maximum = 0;
  // Oldest orders receive the first IDs; existing IDs never change.
  for await (const order of orders.find({}, { projection: { _id: 1, orderId: 1 } }).sort({ createdAt: 1, _id: 1 })) {
    if (order.orderId == null) {
      missing.push(order._id);
      continue;
    }
    // Older orders may store the same numeric ID as text.
    const orderId = typeof order.orderId === 'string' && /^[1-9]\d*$/.test(order.orderId)
      ? Number(order.orderId) : order.orderId;
    if (!Number.isSafeInteger(orderId) || orderId < 1 || seen.has(orderId)) {
      throw new Error('Existing orderId values must be unique positive integers.');
    }
    seen.add(orderId);
    maximum = Math.max(maximum, orderId);
    if (orderId !== order.orderId) conversions.push({ _id: order._id, previous: order.orderId, orderId });
  }
  const summary = { existingIds: seen.size, ordersWithoutId: missing.length, highestExistingId: maximum, assigned: 0 };
  if (dryRun) return summary;

  for (const order of conversions) {
    await orders.updateOne({ _id: order._id, orderId: order.previous }, { $set: { orderId: order.orderId } });
  }
  await Counter.updateOne({ _id: counterId }, { $max: { value: maximum } }, { upsert: true, setDefaultsOnInsert: false });
  for (const id of missing) {
    const orderId = await nextOrderId();
    const result = await orders.updateOne(
      { _id: id, $or: [{ orderId: { $exists: false } }, { orderId: null }] },
      { $set: { orderId } },
    );
    summary.assigned += result.modifiedCount;
  }
  await orders.createIndex({ orderId: 1 }, { unique: true, sparse: true });
  return summary;
}
