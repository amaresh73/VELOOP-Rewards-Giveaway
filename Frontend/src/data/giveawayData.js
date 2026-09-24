// ─── Giveaway Mock Data ──────────────────────────────────────────────────────
// Exact 8 showcase drops matching the VELOOP Rewards design reference

export const giveawayData = [
  {
    id: 'GW-2026-01',
    slug: 'iphone-15-pro',
    slugAliases: ['summer-elite-drop', 'iphone', 'iphone-15-pro', 'GW-2026-01'],
    title: 'iPhone 15 Pro',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Instant Win',
    prize: 'iPhone 15 Pro',
    category: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    image: '/images/iphone_15_pro.jpg',
    participants: 2400,
    entries: 2400,
    entriesText: '2.4K Entries',
    endsIn: '6d : 12h : 20m',
    startDate: '2026-08-01T09:00:00.000Z',
    endDate: '2026-09-27T23:59:00.000Z',
    description: 'Join this exclusive giveaway for a chance to win an iPhone 15 Pro in natural titanium. Turn simple loyalty actions into flagship rewards.',
    shortDescription: 'Latest iPhone 15 Pro 128GB Titanium',
    badge: 'Tech',
    isLive: true,
    glowColor: 'rgba(168, 85, 247, 0.45)',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 250,
      requirementText: '250 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    rules: [
      'Must be a verified member',
      'One participation per user per giveaway event',
      'Prize can be claimed within 7 days of announcement'
    ],
    terms: [
      'Eligibility: Verified VELOOP members only.',
      'Entry Requirement: 250 VEs required to participate.',
      'Participation: One active entry per account is allowed per giveaway event.',
      'Winner Selection: Random draw among all verified entries.'
    ],
    prizes: [
      {
        id: 'PRIZE-001',
        name: 'iPhone 15 Pro',
        position: '1st Prize',
        image: '/images/iphone_15_pro.jpg',
        description: 'Latest iPhone 15 Pro 128GB Titanium',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹1,29,900'
      }
    ]
  },
  {
    id: 'GW-2026-02',
    slug: 'airpods',
    slugAliases: ['airpods', 'airpods-pro-2', 'GW-2026-02'],
    title: 'Apple AirPods Pro 2',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Audio Gear',
    prize: 'Apple AirPods Pro 2',
    category: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    image: '/images/airpods_pro_2.jpg',
    participants: 1800,
    entries: 1800,
    entriesText: '1.8K Entries',
    endsIn: '4d : 08h : 12m',
    startDate: '2026-08-05T09:00:00.000Z',
    endDate: '2026-09-25T23:59:00.000Z',
    description: 'Immersive active noise cancellation with USB-C MagSafe case and personalized spatial audio.',
    shortDescription: 'AirPods Pro 2 with USB-C MagSafe Case',
    badge: 'Tech',
    isLive: true,
    glowColor: 'rgba(56, 189, 248, 0.4)',
    winnerCount: 3,
    entryRequirement: {
      currency: 'VEs',
      amount: 150,
      requirementText: '150 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: ['Eligibility: Verified VELOOP members only.', 'Random draw among all verified entries.'],
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
    id: 'GW-2026-03',
    slug: 'playstation-5-bundle',
    slugAliases: ['ps5', 'ps5-bundle', 'GW-2026-03'],
    title: 'PlayStation 5 Bundle',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Gaming Console',
    prize: 'PlayStation 5 Bundle',
    category: 'Gaming',
    prizeCategory: 'Gaming',
    prizeType: 'PHYSICAL',
    image: '/images/ps5_bundle_spotlight.jpg',
    participants: 8400,
    entries: 8420,
    entriesText: '8.4K Entries',
    endsIn: '12d : 08h : 45m',
    startDate: '2026-08-10T09:00:00.000Z',
    endDate: '2026-10-03T23:59:00.000Z',
    description: 'Next-gen gaming. Higher level experiences. Includes PS5 Disc Console, DualSense Wireless Controller, and 1 Year PS Plus.',
    shortDescription: 'PS5 Disc Console + DualSense + 1 Year PS Plus',
    badge: 'Gaming',
    isLive: true,
    glowColor: 'rgba(168, 85, 247, 0.55)',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 500,
      requirementText: '500 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 750
    },
    terms: ['Eligibility: Verified VELOOP members only.', 'Delivery insured nationwide.'],
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
    id: 'GW-2026-04',
    slug: 'amazon-2000',
    slugAliases: ['amazon-2000', 'amazon-gift-card', 'GW-2026-04'],
    title: 'Amazon Gift Card ₹2,000',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Gift Card',
    prize: 'Amazon Gift Card ₹2,000',
    category: 'Gift Cards',
    prizeCategory: 'Gift Cards',
    prizeType: 'GIFT_CARD',
    image: '/images/amazon_gift_card.jpg',
    participants: 3100,
    entries: 3100,
    entriesText: '3.1K Entries',
    endsIn: '2d : 06h : 40m',
    startDate: '2026-08-12T09:00:00.000Z',
    endDate: '2026-09-23T23:59:00.000Z',
    description: 'Instant digital shopping reward delivered straight to your email. Shop across millions of products.',
    shortDescription: '₹2,000 Amazon Instant Digital Voucher',
    badge: 'Gift Card',
    isLive: true,
    glowColor: 'rgba(245, 158, 11, 0.45)',
    winnerCount: 10,
    entryRequirement: {
      currency: 'VEs',
      amount: 100,
      requirementText: '100 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: ['Eligibility: Verified VELOOP members only.', 'Digital claim delivered via email.'],
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
    id: 'GW-2026-05',
    slug: 'apple-watch',
    slugAliases: ['apple-watch', 'apple-watch-series-9', 'GW-2026-05'],
    title: 'Apple Watch Series 9',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Smart Wearable',
    prize: 'Apple Watch Series 9',
    category: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    image: '/images/apple_watch_series_9.jpg',
    participants: 1200,
    entries: 1200,
    entriesText: '1.2K Entries',
    endsIn: '5d : 14h : 10m',
    startDate: '2026-08-05T09:00:00.000Z',
    endDate: '2026-09-26T23:59:00.000Z',
    description: 'Advanced health metrics, OLED Always-On Retina display, S9 SiP processor, and double tap gesture.',
    shortDescription: 'Apple Watch Series 9 GPS 45mm',
    badge: 'Tech',
    isLive: true,
    glowColor: 'rgba(168, 85, 247, 0.45)',
    winnerCount: 2,
    entryRequirement: {
      currency: 'VEs',
      amount: 200,
      requirementText: '200 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: ['Eligibility: Verified VELOOP members only.'],
    prizes: [
      {
        id: 'PRIZE-005',
        name: 'Apple Watch Series 9',
        position: 'Wearables Drop',
        image: '/images/apple_watch_series_9.jpg',
        description: 'Apple Watch Series 9 45mm GPS',
        winnerCount: 2,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹44,900'
      }
    ]
  },
  {
    id: 'GW-2026-06',
    slug: 'samsung-galaxy-s24',
    slugAliases: ['s24', 'samsung-galaxy-s24', 'GW-2026-06'],
    title: 'Samsung Galaxy S24',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Mobile Flagship',
    prize: 'Samsung Galaxy S24',
    category: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    image: '/images/samsung_galaxy_s24.jpg',
    participants: 980,
    entries: 980,
    entriesText: '980 Entries',
    endsIn: '9d : 10h : 35m',
    startDate: '2026-08-14T09:00:00.000Z',
    endDate: '2026-09-30T23:59:00.000Z',
    description: 'Galaxy AI smartphone with dynamic AMOLED 2X, Nightography, and all-day intelligent battery.',
    shortDescription: 'Samsung Galaxy S24 256GB Cobalt Violet',
    badge: 'Tech',
    isLive: false,
    glowColor: 'rgba(99, 102, 241, 0.4)',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 250,
      requirementText: '250 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: ['Eligibility: Verified VELOOP members only.'],
    prizes: [
      {
        id: 'PRIZE-006',
        name: 'Samsung Galaxy S24',
        position: 'Android Flagship',
        image: '/images/samsung_galaxy_s24.jpg',
        description: 'Samsung Galaxy S24 256GB',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹79,999'
      }
    ]
  },
  {
    id: 'GW-2026-07',
    slug: 'macbook-air-m2',
    slugAliases: ['macbook', 'macbook-air', 'GW-2026-07'],
    title: 'MacBook Air M2',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Laptop',
    prize: 'MacBook Air M2',
    category: 'Tech',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    image: '/images/macbook_air_m2.png',
    participants: 760,
    entries: 760,
    entriesText: '760 Entries',
    endsIn: '15d : 04h : 20m',
    startDate: '2026-08-16T09:00:00.000Z',
    endDate: '2026-10-06T23:59:00.000Z',
    description: 'Strikingly thin design with Apple M2 silicon chip, Liquid Retina display, and up to 18 hours battery life.',
    shortDescription: 'Apple MacBook Air M2 13.6-inch Midnight',
    badge: 'Tech',
    isLive: false,
    glowColor: 'rgba(168, 85, 247, 0.4)',
    winnerCount: 1,
    entryRequirement: {
      currency: 'VEs',
      amount: 400,
      requirementText: '400 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 750
    },
    terms: ['Eligibility: Verified VELOOP members only.'],
    prizes: [
      {
        id: 'PRIZE-007',
        name: 'MacBook Air M2',
        position: 'Computing Drop',
        image: '/images/macbook_air_m2.png',
        description: 'MacBook Air M2 256GB SSD',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹99,900'
      }
    ]
  },
  {
    id: 'GW-2026-08',
    slug: 'nike-gift-card',
    slugAliases: ['nike', 'nike-card', 'GW-2026-08'],
    title: 'Nike Gift Card $100',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Lifestyle Card',
    prize: 'Nike Gift Card $100',
    category: 'Lifestyle',
    prizeCategory: 'Lifestyle',
    prizeType: 'GIFT_CARD',
    image: '/images/nike_gift_card.png',
    participants: 2100,
    entries: 2100,
    entriesText: '2.1K Entries',
    endsIn: '2d : 08h : 15m',
    startDate: '2026-08-16T09:00:00.000Z',
    endDate: '2026-09-23T23:59:00.000Z',
    description: 'Gear up with $100 credit redeemable on Nike.com and Nike retail stores worldwide for footwear and apparel.',
    shortDescription: '$100 Official Nike Digital Gift Card',
    badge: 'Lifestyle',
    isLive: false,
    glowColor: 'rgba(239, 68, 68, 0.45)',
    winnerCount: 5,
    entryRequirement: {
      currency: 'VEs',
      amount: 150,
      requirementText: '150 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: ['Eligibility: Open to all members worldwide.'],
    prizes: [
      {
        id: 'PRIZE-008',
        name: 'Nike Gift Card $100',
        position: 'Sports Drop',
        image: '/images/nike_gift_card.png',
        description: '$100 Official Nike Digital Gift Voucher',
        winnerCount: 5,
        type: 'GIFT_CARD',
        claimType: 'email',
        value: '$100'
      }
    ]
  }
];

// Current giveaway winners (used for winner matching – currentUserId detection)
export const currentWinnerData = [
  {
    userId: 'VE10025',
    name: 'VE****25',
    prize: 'Apple Watch Series 9',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    giveaway: 'Summer Elite Drop',
    date: '18 Sep 2026',
    status: 'Winner',
    claimState: 'Not Submitted'
  },
  {
    userId: 'VE10044',
    name: 'VE****44',
    prize: 'Apple AirPods Pro 2',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    giveaway: 'Summer Elite Drop',
    date: '18 Sep 2026',
    status: 'Winner',
    claimState: 'Submitted'
  }
];

// Previous giveaway winners (completed events)
export const previousWinnerData = [
  {
    userId: 'VE10082',
    name: 'VE****82',
    prize: 'iPhone 15 Pro',
    prizeCategory: 'Tech',
    prizeType: 'PHYSICAL',
    giveaway: 'August Reward Rush',
    date: '15 Sep 2026',
    status: 'Completed'
  },
  {
    userId: 'VE10033',
    name: 'VE****33',
    prize: 'PlayStation 5 Bundle',
    prizeCategory: 'Gaming',
    prizeType: 'PHYSICAL',
    giveaway: 'Summer Rewards',
    date: '10 Sep 2026',
    status: 'Completed'
  },
  {
    userId: 'VE10057',
    name: 'VE****57',
    prize: 'Amazon Gift Card ₹2,000',
    prizeCategory: 'Gift Cards',
    prizeType: 'GIFT_CARD',
    giveaway: 'Weekend Bonus Drop',
    date: '02 Sep 2026',
    status: 'Completed'
  },
  {
    userId: 'VE10041',
    name: 'VE****41',
    prize: 'Nike Gift Card $100',
    prizeCategory: 'Lifestyle',
    prizeType: 'GIFT_CARD',
    giveaway: 'July Power Boost',
    date: '28 Aug 2026',
    status: 'Completed'
  }
];

// ─── Winner Slider Fallback Messages ─────────────────────────────────────────
export const demoWinnerSliderMessages = [
  '🎉 User VE****72 won an iPhone 15 Pro',
  '🏆 Another lucky participant won a PlayStation 5 Bundle',
  '🎧 A participant won Apple AirPods Pro 2',
  '🎁 Someone won an Amazon Gift Card ₹2,000',
  '⌚ User VE****83 won an Apple Watch Series 9',
  '💻 User VE****92 won a MacBook Air M2'
];

export const winnerData = [
  { name: 'MD****421', reward: 'iPhone 15 Pro', date: '2d ago' },
  { name: 'LR****728', reward: 'Amazon Gift Card ₹2,000', date: '5d ago' },
  { name: 'SN****119', reward: 'Apple AirPods Pro 2', date: '1w ago' },
  { name: 'KA****962', reward: 'PlayStation 5 Bundle', date: '2w ago' }
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
export const faqData = [
  {
    question: 'How do I participate in a giveaway?',
    answer: 'Select any active giveaway drop, review the requirements, and click "Enter Now". Complete simple platform tasks or stake loyalty points to secure your ticket.'
  },
  {
    question: 'Can I participate more than once in the same giveaway?',
    answer: 'Each verified member is allotted eligible entries based on platform tier. Multiple verified tasks unlock extra entries up to the drop limit.'
  },
  {
    question: 'How are winners selected?',
    answer: 'Winners are determined through an auditable, verifiable random draw algorithm as soon as the countdown timer concludes.'
  },
  {
    question: 'When and how are winners announced?',
    answer: 'Announcements are published in real time on this dashboard and direct notifications are dispatched to the winners account.'
  },
  {
    question: 'How do I claim my prize if I win?',
    answer: 'Winners will see an instant "Claim Prize" button. Digital gift cards are distributed to verified emails within 48 hours, while physical gadgets are shipped via insured partner courier.'
  }
];
