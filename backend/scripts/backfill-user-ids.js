import 'dotenv/config';
import mongoose from 'mongoose';
import { initializeUserIds } from '../src/services/userIds.js';

try {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000, autoIndex: false, autoCreate: false,
  });
  const summary = await initializeUserIds(mongoose.connection.collection('users'), {
    dryRun: process.argv.includes('--dry-run'),
  });
  console.log(JSON.stringify(summary));
} catch (error) {
  console.error('userId migration failed:', error.name);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
