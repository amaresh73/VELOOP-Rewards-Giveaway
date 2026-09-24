import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Giveaway from './src/models/Giveaway.js';

dotenv.config();

const giveawaySeed = [
  {
    giveawayCode: 'GW-2026-01',
    slug: 'iphone-15-pro',
    title: 'iPhone 15 Pro',
    prize: 'iPhone 15 Pro',
    badge: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1695048133142-1f7f6d9af86d?auto=format&fit=crop&w=900&q=80',
    participants: 2400,
    entries: 2400,
    endsIn: '6d : 12h : 20m',
    description: 'Join this exclusive giveaway for a chance to win an iPhone 15 Pro in natural titanium. Turn simple loyalty actions into flagship rewards.',
    shortDescription: 'Latest iPhone 15 Pro 128GB Titanium',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 250,
      requirementText: '250 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    prizes: [
      {
        id: 'PRIZE-001',
        name: 'iPhone 15 Pro',
        position: '1st Prize',
        image: 'https://images.unsplash.com/photo-1695048133142-1f7f6d9af86d?auto=format&fit=crop&w=900&q=80',
        description: 'Latest iPhone 15 Pro 128GB Titanium',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹1,29,900'
      }
    ]
  },
  {
    giveawayCode: 'GW-2026-02',
    slug: 'airpods',
    title: 'Apple AirPods Pro 2',
    prize: 'Apple AirPods Pro 2',
    badge: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    status: 'ACTIVE',
    image: '/images/airpods_pro_2.jpg',
    participants: 1800,
    entries: 1800,
    endsIn: '4d : 08h : 12m',
    description: 'Immersive active noise cancellation with USB-C MagSafe case and personalized spatial audio.',
    shortDescription: 'AirPods Pro 2 with USB-C MagSafe Case',
    winnerCount: 3,
    entryRequirement: {
      currency: 'VEs',
      amount: 150,
      requirementText: '150 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    prizes: [
      {
        id: 'PRIZE-002',
        name: 'Apple AirPods Pro 2',
        position: 'Audio Drop',
        image: '/images/airpods_pro_2.jpg',
        description: 'Apple AirPods Pro 2 Active Noise Cancelling',
        winnerCount: 3,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹24,900'
      }
    ]
  },
  {
    giveawayCode: 'GW-2026-03',
    slug: 'playstation-5-bundle',
    title: 'PlayStation 5 Bundle',
    prize: 'PlayStation 5 Bundle',
    badge: 'Gaming',
    prizeCategory: 'Gaming',
    prizeType: 'PHYSICAL',
    status: 'ACTIVE',
    image: '/images/ps5_bundle_spotlight.jpg',
    participants: 8400,
    entries: 8420,
    endsIn: '12d : 08h : 45m',
    description: 'Next-gen gaming. Higher level experiences. Includes PS5 Disc Console, DualSense Wireless Controller, and 1 Year PS Plus.',
    shortDescription: 'PS5 Disc Console + DualSense + 1 Year PS Plus',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 500,
      requirementText: '500 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 750
    },
    prizes: [
      {
        id: 'PRIZE-003',
        name: 'PlayStation 5 Bundle',
        position: 'Grand Gaming Prize',
        image: '/images/ps5_bundle_spotlight.jpg',
        description: 'PlayStation 5 Disc Console + DualSense Controller',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹54,990'
      }
    ]
  },
  {
    giveawayCode: 'GW-2026-04',
    slug: 'amazon-2000',
    title: 'Amazon Gift Card ₹2,000',
    prize: 'Amazon Gift Card ₹2,000',
    badge: 'Gift Card',
    prizeCategory: 'Gift Cards',
    prizeType: 'GIFT_CARD',
    status: 'ACTIVE',
    image: '/images/amazon_gift_card.jpg',
    participants: 3100,
    entries: 3100,
    endsIn: '2d : 06h : 40m',
    description: 'Instant digital shopping reward delivered straight to your email. Shop across millions of products.',
    shortDescription: '₹2,000 Amazon Instant Digital Voucher',
    winnerCount: 10,
    entryRequirement: {
      currency: 'VEs',
      amount: 100,
      requirementText: '100 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    prizes: [
      {
        id: 'PRIZE-004',
        name: 'Amazon Gift Card ₹2,000',
        position: 'Digital Voucher',
        image: '/images/amazon_gift_card.jpg',
        description: '₹2,000 Amazon E-Gift Voucher',
        winnerCount: 10,
        type: 'GIFT_CARD',
        claimType: 'email',
        value: '₹2,000'
      }
    ]
  },
  {
    giveawayCode: 'GW-2026-05',
    slug: 'apple-watch',
    title: 'Apple Watch Series 9',
    prize: 'Apple Watch Series 9',
    badge: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    participants: 1200,
    entries: 1200,
    endsIn: '5d : 14h : 10m',
    description: 'Advanced health metrics, OLED Always-On Retina display, S9 SiP processor, and double tap gesture.',
    shortDescription: 'Apple Watch Series 9 GPS 45mm',
    winnerCount: 2,
    entryRequirement: {
      currency: 'VEs',
      amount: 200,
      requirementText: '200 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    prizes: [
      {
        id: 'PRIZE-005',
        name: 'Apple Watch Series 9',
        position: 'Wearables Drop',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
        description: 'Apple Watch Series 9 45mm GPS',
        winnerCount: 2,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹44,900'
      }
    ]
  },
  {
    giveawayCode: 'GW-2026-06',
    slug: 'samsung-galaxy-s24',
    title: 'Samsung Galaxy S24',
    prize: 'Samsung Galaxy S24',
    badge: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
    participants: 980,
    entries: 980,
    endsIn: '9d : 10h : 35m',
    description: 'Galaxy AI smartphone with dynamic AMOLED 2X, Nightography, and all-day intelligent battery.',
    shortDescription: 'Samsung Galaxy S24 256GB Cobalt Violet',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 250,
      requirementText: '250 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    prizes: [
      {
        id: 'PRIZE-006',
        name: 'Samsung Galaxy S24',
        position: 'Android Flagship',
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=900&q=80',
        description: 'Samsung Galaxy S24 256GB',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹79,999'
      }
    ]
  },
  {
    giveawayCode: 'GW-2026-07',
    slug: 'macbook-air-m2',
    title: 'MacBook Air M2',
    prize: 'MacBook Air M2',
    badge: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
    participants: 760,
    entries: 760,
    endsIn: '15d : 04h : 20m',
    description: 'Strikingly thin design with Apple M2 silicon chip, Liquid Retina display, and up to 18 hours battery life.',
    shortDescription: 'Apple MacBook Air M2 13.6-inch Midnight',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 400,
      requirementText: '400 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 750
    },
    prizes: [
      {
        id: 'PRIZE-007',
        name: 'MacBook Air M2',
        position: 'Computing Drop',
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
        description: 'MacBook Air M2 256GB SSD',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹99,900'
      }
    ]
  },
  {
    giveawayCode: 'GW-2026-08',
    slug: 'nike-gift-card',
    title: 'Nike Gift Card $100',
    prize: 'Nike Gift Card $100',
    badge: 'Lifestyle',
    prizeCategory: 'Lifestyle',
    prizeType: 'GIFT_CARD',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
    participants: 2100,
    entries: 2100,
    endsIn: '2d : 08h : 15m',
    description: 'Gear up with $100 credit redeemable on Nike.com and Nike retail stores worldwide for footwear and apparel.',
    shortDescription: '$100 Official Nike Digital Gift Card',
    winnerCount: 5,
    entryRequirement: {
      currency: 'VEs',
      amount: 150,
      requirementText: '150 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    prizes: [
      {
        id: 'PRIZE-008',
        name: 'Nike Gift Card $100',
        position: 'Lifestyle Prize',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
        description: '$100 Official Nike E-Voucher',
        winnerCount: 5,
        type: 'GIFT_CARD',
        claimType: 'email',
        value: '₹8,300'
      }
    ]
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

    console.log('Seed data inserted successfully with 8 reference drops');
  } catch (error) {
    console.error('Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedDatabase();
