import mongoose from 'mongoose';

const winnerSchema = new mongoose.Schema(
  {
    giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', required: true, index: true },
    prizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prize', index: true },
    userId: { type: String, required: true, index: true },
    selectionMethod: { type: String, default: 'random' },
    status: { type: String, enum: ['selected', 'claimed', 'expired'], default: 'selected' },
    selectedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

winnerSchema.index({ giveawayId: 1, userId: 1 }, { unique: true });

export default mongoose.model('GiveawayWinner', winnerSchema);
