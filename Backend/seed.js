import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const giveawaySeed = [
  {
    title: 'Summer Elite Drop',
    slug: 'summer-elite-drop',
    status: 'live',
    prize: '$500 Amazon Gift Card',
    description: 'Unlock exclusive summer prizes with Veloop points and instant reward draws.',
    giveawayCode: 'GW-001',
    participants: 1248,
    entries: 21980
  },
  {
    title: 'Crypto Freedom Bundle',
    slug: 'crypto-freedom-bundle',
    status: 'upcoming',
    prize: '1 BTC + 3 Premium Rewards',
    description: 'A premium giveaway designed for high-earning loyalty members and community champions.',
    giveawayCode: 'GW-002',
    participants: 3210,
    entries: 48250
  },
  {
    title: 'Weekend Tech Chest',
    slug: 'weekend-tech-chest',
    status: 'ending-soon',
    prize: 'MacBook Pro + AirPods',
    description: 'A weekend burst of premium tech rewards for community members who stay active.',
    giveawayCode: 'GW-003',
    participants: 918,
    entries: 16340
  }
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veloop-giveaway';
    await mongoose.connect(mongoUri);

    const db = mongoose.connection.db;
    const collection = db.collection('giveaways');
    await collection.deleteMany({});
    await collection.insertMany(giveawaySeed);

    console.log('Seed data inserted successfully');
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
