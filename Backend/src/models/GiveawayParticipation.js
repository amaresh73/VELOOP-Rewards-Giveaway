import mongoose from 'mongoose';

const participationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', required: true },
    prizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prize' },
    deviceHash: { type: String, select: false },
    status: { type: String, enum: ['joined', 'cancelled', 'winner'], default: 'joined' },
    entryCount: { type: Number, default: 1 },
    requestKey: { type: String, index: true },
    entryCurrency: { type: String, enum: ['VEs', 'SVEs', 'Tokens'], default: 'VEs' },
    entryAmount: { type: Number, default: 0 },
    transactionId: { type: String },
    joinedAt: { type: Date, default: Date.now },
    currency: { type: String, enum: ['VEs', 'SVEs', 'Tokens'], default: 'VEs' },
    amount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

participationSchema.index({ userId: 1, giveawayId: 1 }, { unique: true });

export default mongoose.model('GiveawayParticipation', participationSchema);
