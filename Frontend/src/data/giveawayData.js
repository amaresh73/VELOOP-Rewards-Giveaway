// ─── Giveaway Mock Data ──────────────────────────────────────────────────────
// Structure mirrors the API response so the frontend can be connected to the
// real backend later with minimal changes. Do not hardcode business logic here.

export const giveawayData = [
  {
    id: 'GW-2026-01',
    slug: 'iphone-15-pro',
    slugAliases: ['summer-elite-drop', 'iphone', 'iphone-15-pro', 'GW-2026-01'],
    title: 'Win an iPhone 15 Pro',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Instant Win',
    prize: 'iPhone 15 Pro',
    prizeCategory: 'Mobile',
    prizeType: 'PHYSICAL',
    image: 'https://images.unsplash.com/photo-1695048133142-1f7f6d9af86d?auto=format&fit=crop&w=900&q=80',
    participants: 2300,
    entries: 21980,
    endsIn: '12d : 08h : 50m',
    startDate: '2026-08-01T09:00:00.000Z',
    endDate: '2026-09-15T23:59:00.000Z',
    description: 'Join this exclusive giveaway for a chance to win an iPhone 15 Pro. Complete eligible activities, earn entries, and secure your shot at the ultimate flagship smartphone.',
    shortDescription: 'Latest iPhone 15 Pro 128GB',
    badge: 'EXCLUSIVE GIVEAWAY',
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
      'Giveaway Duration: This giveaway runs until the close timer finishes.',
      'Winner Selection: A verified single winner is selected according to platform rules.',
      'Winner Announcement: Announced on the giveaway page and account dashboard.',
      'Prize Claim: Physical delivery address and phone number required.',
      'Claim Deadline: 7 days from winner announcement.'
    ],
    prizes: [
      {
        id: 'PRIZE-001',
        name: 'iPhone 15 Pro',
        position: '1st Prize',
        image: 'https://images.unsplash.com/photo-1695048133142-1f7f6d9af86d?auto=format&fit=crop&w=900&q=80',
        description: 'Latest iPhone 15 Pro 128GB',
        winnerCount: 1,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹1,29,900',
        deliveryInfo: 'Delivered by verified partner courier after claim approval.'
      }
    ]
  },
  {
    id: 'GW-2026-02',
    slug: 'apple-watch',
    slugAliases: ['apple-watch', 'apple-watch-series-9', 'GW-2026-02'],
    title: 'Apple Watch Series 9',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Smart Wearable',
    prize: 'Apple Watch Series 9',
    prizeCategory: 'Wearable',
    prizeType: 'PHYSICAL',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    participants: 1800,
    entries: 15400,
    endsIn: '9d : 06h : 30m',
    startDate: '2026-08-05T09:00:00.000Z',
    endDate: '2026-09-14T23:59:00.000Z',
    description: 'Smart fitness tracking with all-day battery, ECG sensors, and OLED Always-On display. Stand a chance to win the Apple Watch Series 9.',
    shortDescription: 'Latest Apple Watch Series 9',
    badge: 'FEATURED DROP',
    winnerCount: 3,
    entryRequirement: {
      currency: 'VEs',
      amount: 200,
      requirementText: '200 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: [
      'Eligibility: Verified VELOOP members only.',
      'Entry Requirement: 200 VEs required to participate.',
      'Participation: One active entry per account is allowed.',
      'Giveaway Duration: Closes when countdown reaches zero.',
      'Winner Selection: 3 winners selected via automated random draw.',
      'Prize Claim: Physical shipping address required upon winning.',
      'Claim Deadline: 7 days from winner announcement.'
    ],
    prizes: [
      {
        id: 'PRIZE-002',
        name: 'Apple Watch Series 9',
        position: '2nd Prize',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
        description: 'Latest Apple Watch Series 9 GPS + Cellular',
        winnerCount: 3,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹46,900'
      }
    ]
  },
  {
    id: 'GW-2026-03',
    slug: 'airpods',
    slugAliases: ['airpods', 'airpods-pro-2', 'GW-2026-03'],
    title: 'AirPods Pro 2',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Audio Gear',
    prize: 'AirPods Pro 2',
    prizeCategory: 'Audio',
    prizeType: 'PHYSICAL',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
    participants: 3100,
    entries: 34200,
    endsIn: '7d : 09h : 20m',
    startDate: '2026-08-10T09:00:00.000Z',
    endDate: '2026-09-12T23:59:00.000Z',
    description: 'Immersive active noise cancellation with USB-C MagSafe case and personalized spatial audio. Win the new AirPods Pro 2.',
    shortDescription: 'Active Noise Cancellation',
    badge: 'COMMUNITY CHOICE',
    winnerCount: 5,
    entryRequirement: {
      currency: 'SVEs',
      amount: 500,
      requirementText: '500 SVEs',
      entryLabel: 'Entry Fee',
      mockBalance: 750
    },
    terms: [
      'Eligibility: Verified VELOOP members only.',
      'Entry Requirement: 500 SVEs required to participate.',
      'Participation: One active entry per account.',
      'Giveaway Duration: Closes when countdown reaches zero.',
      'Winner Selection: 5 winners selected via verified random draw.',
      'Prize Claim: Physical shipping address required.',
      'Claim Deadline: 7 days from winner announcement.'
    ],
    prizes: [
      {
        id: 'PRIZE-003',
        name: 'AirPods Pro 2',
        position: '3rd Prize',
        image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=900&q=80',
        description: 'Active Noise Cancellation with MagSafe Case',
        winnerCount: 5,
        type: 'PHYSICAL',
        claimType: 'delivery',
        value: '₹24,900'
      }
    ]
  },
  {
    id: 'GW-2026-04',
    slug: 'amazon-2000',
    slugAliases: ['amazon-2000', 'amazon-gift-card', 'GW-2026-04'],
    title: '₹2,000 Amazon Voucher',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Gift Card',
    prize: '₹2,000 Amazon Gift Card',
    prizeCategory: 'Gift Card',
    prizeType: 'GIFT_CARD',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80',
    participants: 1300,
    entries: 12500,
    endsIn: '5d : 12h : 15m',
    startDate: '2026-08-12T09:00:00.000Z',
    endDate: '2026-09-10T23:59:00.000Z',
    description: 'Flexible digital shopping reward redeemable across millions of products on Amazon India. Win a ₹2,000 digital voucher delivered directly to your email.',
    shortDescription: '₹2,000 Amazon Gift Card',
    badge: 'LUCKY DRAW',
    winnerCount: 10,
    entryRequirement: {
      currency: 'VEs',
      amount: 500,
      requirementText: '500 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: [
      'Eligibility: Verified VELOOP members only.',
      'Entry Requirement: 500 VEs required to participate.',
      'Participation: One active entry per account.',
      'Giveaway Duration: Closes when countdown reaches zero.',
      'Winner Selection: 10 lucky draw winners selected randomly.',
      'Prize Claim: Delivered via digital voucher code to verified email within 48h.',
      'Claim Deadline: 7 days from winner announcement.'
    ],
    prizes: [
      {
        id: 'PRIZE-004',
        name: 'Amazon Gift Card',
        position: 'Lucky Draw',
        image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80',
        description: '₹2,000 Amazon Gift Card',
        winnerCount: 10,
        type: 'GIFT_CARD',
        claimType: 'email',
        value: '₹2,000'
      }
    ]
  },
  {
    id: 'GW-2026-05',
    slug: 'amazon-500',
    slugAliases: ['amazon-500', 'GW-2026-05'],
    title: '₹500 Amazon Voucher',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Gift Card',
    prize: '₹500 Amazon Gift Card',
    prizeCategory: 'Gift Card',
    prizeType: 'GIFT_CARD',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
    participants: 4200,
    entries: 28900,
    endsIn: '4d : 18h : 10m',
    startDate: '2026-08-14T09:00:00.000Z',
    endDate: '2026-09-09T23:59:00.000Z',
    description: 'Instant ₹500 Amazon digital e-voucher. Great odds with 25 guaranteed winners from our active community.',
    shortDescription: '₹500 Amazon Gift Card',
    badge: 'HOT DROP',
    winnerCount: 25,
    entryRequirement: {
      currency: 'VEs',
      amount: 300,
      requirementText: '300 VEs',
      entryLabel: 'Entry Fee',
      mockBalance: 350
    },
    terms: [
      'Eligibility: Verified VELOOP members only.',
      'Entry Requirement: 300 VEs required to participate.',
      'Participation: One active entry per account.',
      'Giveaway Duration: Closes when countdown reaches zero.',
      'Winner Selection: 25 winners selected via verified random draw.',
      'Prize Claim: Direct email code distribution within 24 hours.',
      'Claim Deadline: 7 days from winner announcement.'
    ],
    prizes: [
      {
        id: 'PRIZE-005',
        name: '₹500 Amazon Voucher',
        position: 'Community Drop',
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=900&q=80',
        description: '₹500 Amazon E-Voucher Code',
        winnerCount: 25,
        type: 'GIFT_CARD',
        claimType: 'email',
        value: '₹500'
      }
    ]
  },
  {
    id: 'GW-2026-06',
    slug: 'amazon-20',
    slugAliases: ['amazon-20', 'voucher-20', 'tokens-drop', 'GW-2026-06'],
    title: '₹20 Instant Voucher',
    status: 'active',
    lifecycleStatus: 'active',
    type: 'Token Voucher',
    prize: '₹20 Reward Voucher',
    prizeCategory: 'Digital',
    prizeType: 'DIGITAL',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80',
    participants: 7800,
    entries: 52400,
    endsIn: '1d : 04h : 20m',
    startDate: '2026-08-16T09:00:00.000Z',
    endDate: '2026-09-06T23:59:00.000Z',
    description: 'High-frequency micro-reward voucher redeemable using your loyalty platform Tokens. 100 lucky participants will receive this instant drop!',
    shortDescription: '₹20 Instant Reward Voucher',
    badge: 'DAILY DROP',
    winnerCount: 100,
    entryRequirement: {
      currency: 'Tokens',
      amount: 2000,
      requirementText: '2,000 Tokens',
      entryLabel: 'Entry Fee',
      mockBalance: 2500
    },
    terms: [
      'Eligibility: Open to all members with active token balance.',
      'Entry Requirement: 2,000 Tokens required to participate.',
      'Participation: One active entry per account.',
      'Giveaway Duration: 24h flash drop cycle.',
      'Winner Selection: 100 winners selected via provably random draw.',
      'Prize Claim: Auto-credited or delivered to user inbox instantly.',
      'Claim Deadline: 7 days from winner announcement.'
    ],
    prizes: [
      {
        id: 'PRIZE-006',
        name: '₹20 Instant Voucher',
        position: 'Daily Micro-Reward',
        image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=900&q=80',
        description: '₹20 Digital Instant Voucher',
        winnerCount: 100,
        type: 'DIGITAL',
        claimType: 'instant',
        value: '₹20'
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
    prizeCategory: 'Wearable',
    prizeType: 'PHYSICAL',
    giveaway: 'Summer Elite Drop',
    date: '06 Aug 2026',
    status: 'Winner',
    claimState: 'Not Submitted'
  },
  {
    userId: 'VE10044',
    name: 'VE****44',
    prize: 'AirPods Pro',
    prizeCategory: 'Audio',
    prizeType: 'PHYSICAL',
    giveaway: 'Summer Elite Drop',
    date: '06 Aug 2026',
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
    prizeCategory: 'Mobile',
    prizeType: 'PHYSICAL',
    giveaway: 'August Reward Rush',
    date: '05 Aug 2026',
    status: 'Completed'
  },
  {
    userId: 'VE10033',
    name: 'VE****33',
    prize: 'Apple Watch Series 9',
    prizeCategory: 'Wearable',
    prizeType: 'PHYSICAL',
    giveaway: 'Summer Rewards',
    date: '06 Aug 2026',
    status: 'Completed'
  },
  {
    userId: 'VE10057',
    name: 'VE****57',
    prize: '₹2,000 Amazon Gift Card',
    prizeCategory: 'Gift Card',
    prizeType: 'GIFT_CARD',
    giveaway: 'Weekend Bonus Drop',
    date: '18 Jul 2026',
    status: 'Completed'
  },
  {
    userId: 'VE10041',
    name: 'VE****41',
    prize: 'AirPods Pro',
    prizeCategory: 'Audio',
    prizeType: 'PHYSICAL',
    giveaway: 'July Power Boost',
    date: '12 Jul 2026',
    status: 'Completed'
  }
];

// ─── Winner Slider Fallback Messages ─────────────────────────────────────────
export const demoWinnerSliderMessages = [
  '🎉 User VE****72 won an iPhone 15 Pro',
  '🏆 Another lucky participant won an Apple Watch',
  '🎧 A participant won AirPods Pro',
  '🎁 Someone won an Amazon Gift Card',
  '🎉 User VE****37 won an iPhone 15 Pro',
  '🏆 User VE****83 won an Apple Watch Series 9',
  '🎁 User VE****92 won an Amazon Gift Card',
  '🎧 User VE****14 won AirPods Pro'
];

// ─── Legacy winnerData (used in some components) ─────────────────────────────
export const winnerData = [
  { name: 'MD****421', reward: 'MacBook Pro', date: '2d ago' },
  { name: 'LR****728', reward: '₹2,000 Gift Card', date: '5d ago' },
  { name: 'SN****119', reward: 'AirPods Pro', date: '1w ago' },
  { name: 'KA****962', reward: 'Apple Watch', date: '2w ago' }
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
export const faqData = [
  {
    question: 'How do I participate in a giveaway?',
    answer: 'Create a verified VELOOP Rewards account, ensure you have sufficient VEs/SVEs/Tokens, find an active giveaway, and click "Join Now" to open the individual giveaway page. Review the prize, entry fee, and terms, then confirm your participation.'
  },
  {
    question: 'Can I participate more than once in the same giveaway?',
    answer: 'No. Each verified member may participate once per giveaway event. The system enforces this at the database level. When a new giveaway begins, you can participate again.'
  },
  {
    question: 'How are winners selected?',
    answer: 'Winners are selected by the VELOOP backend after the giveaway closes. Selection is random among all verified participants. The process is documented and auditable.'
  },
  {
    question: 'When are winners announced?',
    answer: 'Winners are announced on this page and via your VELOOP Rewards account dashboard after the giveaway closes and winners are verified.'
  },
  {
    question: 'What happens if I win?',
    answer: 'You will see a special winner notification on this page. You will then need to submit your prize claim details within the claim deadline (typically 7 days). For physical prizes, delivery address is required. For gift cards, only your email is needed.'
  },
  {
    question: 'How do I claim my prize?',
    answer: 'After the giveaway ends, if you are a winner, a "Claim Your Prize" button will appear on this page. Click it, fill in your delivery information (or email for digital rewards), and submit. Our team will process and fulfill your prize.'
  },
  {
    question: 'What currencies can I use to participate?',
    answer: 'Different giveaways require different currencies: VEs, SVEs, or Tokens. The exact requirement is clearly displayed on each giveaway\'s details page before you join.'
  },
  {
    question: 'What happens after the giveaway ends?',
    answer: 'After the giveaway closes, winner selection is finalized. Winners are announced on this page. Existing participants cannot join again. A new giveaway may begin shortly after. Previous winners move to the "Previous Winners" tab.'
  }
];
