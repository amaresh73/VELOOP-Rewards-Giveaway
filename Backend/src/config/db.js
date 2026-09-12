import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Wallet from '../models/Wallet.js';

const ensureDemoUser = async () => {
  const passwordHash = await bcrypt.hash('secret123', 12);
  await User.updateOne(
    { email: 'test@example.com' },
    {
      $set: { phone: '+919876543210' },
      $setOnInsert: { externalId: 'demo-user-1', name: 'Alex Morgan', email: 'test@example.com', passwordHash, role: 'member', verified: true }
    },
    { upsert: true }
  );
  await Wallet.updateOne(
    { userId: 'demo-user-1' },
    { $setOnInsert: { userId: 'demo-user-1', balances: { VEs: 500, SVEs: 1500, Tokens: 3000 } } },
    { upsert: true }
  );

  const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  await User.updateOne(
    { email: adminEmail },
    {
      $set: { phone: '+919999988888' },
      $setOnInsert: { externalId: 'demo-admin-1', name: 'VELOOP Admin', email: adminEmail, passwordHash: adminPasswordHash, role: 'admin', verified: true }
    },
    { upsert: true }
  );
  await Wallet.updateOne(
    { userId: 'demo-admin-1' },
    { $setOnInsert: { userId: 'demo-admin-1', balances: { VEs: 10000, SVEs: 50000, Tokens: 100000 } } },
    { upsert: true }
  );
};

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        await ensureDemoUser();
        console.log('MongoDB connected successfully');
        return true;
      } catch (error) {
        console.warn('Configured MongoDB unavailable; using MongoMemoryServer for local development.');
        console.warn(error.message);
      }
    }

    const memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    await mongoose.connect(uri);
    await ensureDemoUser();

    console.log('Mongo Memory Server connected successfully');
    return true;
  } catch (error) {
    console.warn('MongoDB unavailable: continuing without database connection for local development.');
    console.warn(error.message);
    return false;
  }
};

export default connectDB;
