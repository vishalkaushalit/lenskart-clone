import mongoose from 'mongoose';

// connect-mongo stores serialized session data alongside its expiry date.
export async function loggedInUserIds() {
  const ids = new Set();
  const sessions = mongoose.connection.collection('sessions').find(
    { expires: { $gt: new Date() } }, { projection: { session: 1 } },
  );
  for await (const entry of sessions) {
    let session;
    try { session = typeof entry.session === 'string' ? JSON.parse(entry.session) : entry.session; }
    catch { continue; }
    const id = session?.userId;
    if (typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)) ids.add(id.toLowerCase());
  }
  return [...ids].map((id) => new mongoose.Types.ObjectId(id));
}
