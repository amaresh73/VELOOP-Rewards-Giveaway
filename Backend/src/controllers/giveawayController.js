import Giveaway from '../models/Giveaway.js';
import GiveawayParticipation from '../models/GiveawayParticipation.js';
import GiveawayWinner from '../models/GiveawayWinner.js';
import PrizeClaim from '../models/PrizeClaim.js';

const getEffectiveStatus = (item) => {
  const storedStatus = String(item.status || '').toUpperCase();
  if (storedStatus === 'ARCHIVED') return 'ARCHIVED';
  const now = new Date();
  if (item.startsAt && now < item.startsAt) return 'UPCOMING';
  if (item.endsAt && now > item.endsAt) return 'ENDED';
  return storedStatus === 'UPCOMING' ? 'UPCOMING' : 'ACTIVE';
};

// Seed data strictly matches Statement 11 and rich configurations
const defaultSeedData = [
  {
    title: 'Win an iPhone 15 Pro',
    slug: 'iphone-15-pro',
    badge: 'EXCLUSIVE GIVEAWAY',
    shortDescription: 'Latest iPhone 15 Pro 128GB',
    status: 'ACTIVE',
    type: 'Instant Win',
    prize: 'iPhone 15 Pro',
    prizeCategory: 'Mobile',
    prizeType: 'PHYSICAL',
    description: 'Join this exclusive giveaway for a chance to win an iPhone 15 Pro. Complete eligible activities, earn entries, and secure your shot at the ultimate flagship smartphone.',
    image: '/images/iphone_15_pro.jpg',
    participants: 2300,
    entries: 21980,
    endsIn: '12d : 08h : 50m',
    winnerCount: 1,
    entryRequirement: { currency: 'VEs', amount: 250, requirementText: '250 VEs', entryLabel: 'Entry Fee', mockBalance: 350 },
    rules: [
      'Must be a verified member',
      'One participation per user per giveaway event',
      'Prize can be claimed within 7 days of announcement'
    ],
    terms: [
      'Eligibility: Verified VELOOP members only.',
      'Entry Requirement: 250 VEs required to participate.',
      'Participation: One active entry per account is allowed per giveaway event.',
      'Giveaway Duration: This giveaway runs until the close timer finishes.',
      'Winner Selection: A verified single winner is selected according to platform rules.',
      'Winner Announcement: Announced on the giveaway page and account dashboard.',
      'Prize Claim: Physical delivery address and phone number required.',
      'Claim Deadline: 7 days from winner announcement.'
    ],
    prizes: [
      {
        id: 'PRIZE-001', name: 'iPhone 15 Pro', position: '1st Prize',
        image: '/images/iphone_15_pro.jpg',
        description: 'Latest iPhone 15 Pro 128GB',
        winnerCount: 1, type: 'PHYSICAL', claimType: 'delivery', value: '₹1,29,900',
        deliveryInfo: 'Delivered by verified partner courier after claim approval.'
      }
    ]
  },
  {
    title: 'Apple Watch Series 9',
    slug: 'apple-watch',
    badge: 'FEATURED DROP',
    shortDescription: 'Latest Apple Watch Series 9',
    status: 'ACTIVE',
    type: 'Smart Wearable',
    prize: 'Apple Watch Series 9',
    prizeCategory: 'Wearable',
    prizeType: 'PHYSICAL',
    description: 'Smart fitness tracking with all-day battery, ECG sensors, and OLED Always-On display. Stand a chance to win the Apple Watch Series 9.',
    image: '/images/apple_watch_series_9.jpg',
    participants: 1800,
    entries: 15400,
    endsIn: '9d : 06h : 30m',
    winnerCount: 3,
    entryRequirement: { currency: 'VEs', amount: 200, requirementText: '200 VEs', entryLabel: 'Entry Fee', mockBalance: 350 },
    prizes: [
      {
        id: 'PRIZE-002', name: 'Apple Watch Series 9', position: '2nd Prize',
        image: '/images/apple_watch_series_9.jpg',
        description: 'Latest Apple Watch Series 9 GPS + Cellular',
        winnerCount: 3, type: 'PHYSICAL', claimType: 'delivery', value: '₹46,900'
      }
    ]
  },
  {
    title: 'AirPods Pro 2',
    slug: 'airpods',
    badge: 'COMMUNITY CHOICE',
    shortDescription: 'Active Noise Cancellation',
    status: 'ACTIVE',
    type: 'Audio Gear',
    prize: 'AirPods Pro 2',
    prizeCategory: 'Audio',
    prizeType: 'PHYSICAL',
    description: 'Immersive active noise cancellation with USB-C MagSafe case and personalized spatial audio. Win the new AirPods Pro 2.',
    image: '/images/airpods_pro_2.jpg',
    participants: 3100,
    entries: 34200,
    endsIn: '7d : 09h : 20m',
    winnerCount: 5,
    entryRequirement: { currency: 'SVEs', amount: 500, requirementText: '500 SVEs', entryLabel: 'Entry Fee', mockBalance: 750 },
    prizes: [
      {
        id: 'PRIZE-003', name: 'AirPods Pro 2', position: '3rd Prize',
        image: '/images/airpods_pro_2.jpg',
        description: 'Active Noise Cancellation with MagSafe Case',
        winnerCount: 5, type: 'PHYSICAL', claimType: 'delivery', value: '₹24,900'
      }
    ]
  },
  {
    title: '₹2,000 Amazon Voucher',
    slug: 'amazon-2000',
    badge: 'LUCKY DRAW',
    shortDescription: '₹2,000 Amazon Gift Card',
    status: 'ACTIVE',
    type: 'Gift Card',
    prize: '₹2,000 Amazon Gift Card',
    prizeCategory: 'Gift Card',
    prizeType: 'GIFT_CARD',
    image: '/images/amazon_gift_card.jpg',
    participants: 1300,
    entries: 12500,
    endsIn: '5d : 12h : 15m',
    winnerCount: 10,
    entryRequirement: { currency: 'VEs', amount: 500, requirementText: '500 VEs', entryLabel: 'Entry Fee', mockBalance: 350 },
    prizes: [
      {
        id: 'PRIZE-004', name: 'Amazon Gift Card', position: 'Lucky Draw',
        image: '/images/amazon_gift_card.jpg',
        description: '₹2,000 Amazon Gift Card',
        winnerCount: 10, type: 'GIFT_CARD', claimType: 'email', value: '₹2,000'
      }
    ]
  },
  {
    title: '₹500 Amazon Voucher',
    slug: 'amazon-500',
    badge: 'HOT DROP',
    shortDescription: '₹500 Amazon Gift Card',
    status: 'ACTIVE',
    type: 'Gift Card',
    prize: '₹500 Amazon Gift Card',
    prizeCategory: 'Gift Card',
    prizeType: 'GIFT_CARD',
    image: '/images/amazon_gift_card.jpg',
    participants: 4200,
    entries: 28900,
    endsIn: '4d : 18h : 10m',
    winnerCount: 25,
    entryRequirement: { currency: 'VEs', amount: 300, requirementText: '300 VEs', entryLabel: 'Entry Fee', mockBalance: 350 },
    prizes: [
      {
        id: 'PRIZE-005', name: '₹500 Amazon Voucher', position: 'Community Drop',
        image: '/images/amazon_gift_card.jpg',
        description: '₹500 Amazon E-Voucher Code',
        winnerCount: 25, type: 'GIFT_CARD', claimType: 'email', value: '₹500'
      }
    ]
  },
  {
    title: '₹20 Instant Voucher',
    slug: 'amazon-20',
    badge: 'DAILY DROP',
    shortDescription: '₹20 Instant Reward Voucher',
    status: 'ACTIVE',
    type: 'Token Voucher',
    prize: '₹20 Reward Voucher',
    prizeCategory: 'Digital',
    prizeType: 'DIGITAL',
    image: '/images/amazon_gift_card.jpg',
    participants: 7800,
    entries: 52400,
    endsIn: '1d : 04h : 20m',
    winnerCount: 100,
    entryRequirement: { currency: 'Tokens', amount: 2000, requirementText: '2,000 Tokens', entryLabel: 'Entry Fee', mockBalance: 2500 },
    prizes: [
      {
        id: 'PRIZE-006', name: '₹20 Instant Voucher', position: 'Daily Micro-Reward',
        image: '/images/amazon_gift_card.jpg',
        description: '₹20 Digital Instant Voucher',
        winnerCount: 100, type: 'DIGITAL', claimType: 'instant', value: '₹20'
      }
    ]
  }
];

const normalizeGiveaway = (item) => ({
  id: item._id,
  _id: item._id,
  slug: item.slug,
  giveawayCode: item.giveawayCode,
  title: item.title,
  badge: item.badge || 'EXCLUSIVE GIVEAWAY',
  shortDescription: item.shortDescription || item.description,
  status: getEffectiveStatus(item),
  type: item.type || 'Instant Win',
  prize: item.prize,
  prizeCategory: item.prizeCategory,
  prizeType: item.prizeType || 'PHYSICAL',
  description: item.description,
  startsAt: item.startsAt,
  endsAt: item.endsAt,
  image: item.image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
  participants: item.participants || 0,
  entries: item.entries || 0,
  endsIn: item.endsIn || '06:12:44:18',
  winnerCount: item.winnerCount || item.prizeConfig?.winnerCount || 1,
  prizes: item.prizes || [],
  rules: item.rules || ['Must be a verified member', 'One entry per user', 'Prize claim within 7 days'],
  terms: item.terms || [],
  importantInfo: item.importantInfo || [],
  entryRequirement: item.entryRequirement || { currency: 'VEs', amount: 250, requirementText: '250 VEs', entryLabel: 'Entry Fee', mockBalance: 350 },
  participationSettings: item.participationSettings || { singleEntry: true, multipleEntries: false },
  prizeConfig: item.prizeConfig || { winnerCount: 1, prizeType: 'PHYSICAL' }
});

export const getGiveaways = async (req, res) => {
  try {
    let giveaways = await Giveaway.find().sort({ createdAt: -1 });

    if (!giveaways.length) {
      giveaways = await Giveaway.insertMany(
        defaultSeedData.map((item, index) => ({
          ...item,
          giveawayCode: `GW-${String(index + 1).padStart(3, '0')}`
        }))
      );
    }

    res.json({
      success: true,
      data: giveaways.map(normalizeGiveaway)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentGiveaway = async (req, res) => {
  try {
    let giveaways = await Giveaway.find().sort({ createdAt: -1 });
    if (!giveaways.length) {
      giveaways = await Giveaway.insertMany(
        defaultSeedData.map((item, index) => ({
          ...item,
          giveawayCode: `GW-${String(index + 1).padStart(3, '0')}`
        }))
      );
    }

    const liveGiveaway = giveaways.find((item) =>
      ['live', 'active', 'ending-soon', 'ACTIVE'].includes(String(item.status || '').toLowerCase())
    );
    if (!liveGiveaway) {
      return res.status(404).json({ success: false, message: 'No active giveaway is available.' });
    }
    return res.json({ success: true, data: normalizeGiveaway(liveGiveaway) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGiveawayBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const giveaway = await Giveaway.findOne({ slug });
    if (!giveaway) {
      return res.status(404).json({ success: false, message: 'Giveaway not found' });
    }
    return res.json({ success: true, data: normalizeGiveaway(giveaway) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGiveawayById = async (req, res) => {
  try {
    const { id } = req.params;
    // Try slug first, then ObjectId
    let giveaway = await Giveaway.findOne({ slug: id });
    if (!giveaway) {
      giveaway = await Giveaway.findById(id).catch(() => null);
    }
    if (!giveaway) {
      return res.status(404).json({ success: false, message: 'Giveaway not found' });
    }
    return res.json({ success: true, data: normalizeGiveaway(giveaway) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyParticipationStatus = async (req, res) => {
  try {
    const participation = await GiveawayParticipation.findOne({
      giveawayId: req.params.id,
      userId: req.user.id
    }).select('-deviceHash').lean();
    return res.json({ success: true, data: participation || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load participation status.' });
  }
};

export const getGiveawayWinners = async (req, res) => {
  try {
    const winners = await GiveawayWinner.find({ giveawayId: req.params.id })
      .select('-__v')
      .sort({ selectedAt: -1 })
      .lean();
    return res.json({ success: true, data: winners });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load giveaway winners.' });
  }
};

export const getMyClaim = async (req, res) => {
  try {
    const claim = await PrizeClaim.findOne({ giveawayId: req.params.id, userId: req.user.id })
      .select('giveawayId winnerId status type createdAt updatedAt')
      .lean();
    return res.json({ success: true, data: claim || null });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Unable to load claim status.' });
  }
};
