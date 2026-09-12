import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String, required: true },
  position: { type: String, default: 'Prize' },
  image: { type: String },
  description: { type: String },
  winnerCount: { type: Number, default: 1 },
  type: { type: String, enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL'], default: 'PHYSICAL' },
  claimType: { type: String, enum: ['delivery', 'email', 'wallet', 'instant'], default: 'delivery' },
  value: { type: String },
  deliveryInfo: { type: String }
}, { _id: false });

const giveawaySchema = new mongoose.Schema(
  {
    giveawayCode: { type: String, required: true, unique: true, immutable: true, index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    badge: { type: String, default: 'EXCLUSIVE GIVEAWAY' },
    shortDescription: { type: String },
    status: {
      type: String,
      enum: ['UPCOMING', 'ACTIVE', 'ENDED', 'ARCHIVED', 'draft', 'live', 'upcoming', 'ending-soon', 'closed'],
      default: 'ACTIVE'
    },
    type: { type: String, default: 'Instant Win' },
    prize: { type: String, required: true },
    prizeCategory: { type: String },
    prizeType: { type: String, enum: ['PHYSICAL', 'GIFT_CARD', 'DIGITAL'], default: 'PHYSICAL' },
    description: { type: String },
    image: { type: String },
    startsAt: { type: Date, default: () => new Date(Date.now() - 60 * 60 * 1000) },
    endsAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    participants: { type: Number, default: 0 },
    entries: { type: Number, default: 0 },
    endsIn: { type: String, default: '06:12:44:18' },
    winnerCount: { type: Number, default: 1 },
    // Rich prize configuration (array of individual prizes in a giveaway event)
    prizes: [prizeSchema],
    rules: [{ type: String }],
    terms: [{ type: String }],
    importantInfo: [{ type: String }],
    entryRequirement: {
      currency: { type: String, enum: ['VEs', 'SVEs', 'Tokens'], default: 'VEs' },
      amount: { type: Number, default: 250 },
      requirementText: { type: String },
      entryLabel: { type: String, default: 'Entry Fee' },
      mockBalance: { type: Number, default: 350 }
    },
    participationSettings: {
      singleEntry: { type: Boolean, default: true },
      multipleEntries: { type: Boolean, default: false },
      reEntryAllowed: { type: Boolean, default: false },
      taskBonusAvailable: { type: Boolean, default: true },
      note: { type: String, default: 'Demo wording: one valid entry per member unless platform rules change.' }
    },
    eligibility: [{ type: String }],
    prizeConfig: {
      winnerCount: { type: Number, default: 1 },
      prizeType: { type: String, default: 'PHYSICAL' }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Giveaway', giveawaySchema);
