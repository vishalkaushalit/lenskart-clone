import Counter from '../models/Counter.js';

const counterId = 'users.userId';

export async function nextUserId() {
  let counter;
  try {
    counter = await Counter.findOneAndUpdate(
      { _id: counterId }, { $inc: { value: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: false },
    );
  } catch (error) {
    // Concurrent first allocations can race to create the counter document.
    if (error.code !== 11000) throw error;
    counter = await Counter.findOneAndUpdate(
      { _id: counterId }, { $inc: { value: 1 } }, { new: true },
    );
  }
  if (!counter || !Number.isSafeInteger(counter.value) || counter.value < 1) {
    throw new Error('Unable to allocate a valid userId.');
  }
  return counter.value;
}

export async function initializeUserIds(users, { dryRun = false } = {}) {
  const seen = new Set();
  const missing = [];
  const conversions = [];
  let maximum = 0;
  // Oldest accounts receive the first IDs; existing IDs never change.
  for await (const user of users.find({}, { projection: { _id: 1, userId: 1 } }).sort({ createdAt: 1, _id: 1 })) {
    if (user.userId == null) {
      missing.push(user._id);
      continue;
    }
    // Older accounts may store the same numeric ID as text.
    const userId = typeof user.userId === 'string' && /^[1-9]\d*$/.test(user.userId)
      ? Number(user.userId) : user.userId;
    if (!Number.isSafeInteger(userId) || userId < 1 || seen.has(userId)) {
      throw new Error('Existing userId values must be unique positive integers.');
    }
    seen.add(userId);
    maximum = Math.max(maximum, userId);
    if (userId !== user.userId) conversions.push({ _id: user._id, previous: user.userId, userId });
  }
  const summary = { existingIds: seen.size, usersWithoutId: missing.length, highestExistingId: maximum, assigned: 0 };
  if (dryRun) return summary;

  for (const user of conversions) {
    await users.updateOne({ _id: user._id, userId: user.previous }, { $set: { userId: user.userId } });
  }
  await Counter.updateOne({ _id: counterId }, { $max: { value: maximum } }, { upsert: true, setDefaultsOnInsert: false });
  for (const id of missing) {
    const userId = await nextUserId();
    const result = await users.updateOne(
      { _id: id, $or: [{ userId: { $exists: false } }, { userId: null }] },
      { $set: { userId } },
    );
    summary.assigned += result.modifiedCount;
  }
  await users.createIndex({ userId: 1 }, { unique: true, sparse: true });
  return summary;
}
