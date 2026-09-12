import mongoose from 'mongoose';

const giveawayPrizeSchema = new mongoose.Schema(
  {
    giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', required: true, index: true },
    prizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prize', required: true, index: true },
    position: { type: Number, required: true, min: 1 },
    winnerCount: { type: Number, default: 1, min: 1 }
  },
  { timestamps: true }
);

giveawayPrizeSchema.index({ giveawayId: 1, prizeId: 1 }, { unique: true });

export default mongoose.model('GiveawayPrize', giveawayPrizeSchema);