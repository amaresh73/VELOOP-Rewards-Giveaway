import mongoose from 'mongoose';

const prizeClaimSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', required: true, index: true },
    prizeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Prize', index: true },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'GiveawayWinner' },
    type: { type: String, enum: ['gift-card', 'physical', 'cash', 'tech'], default: 'gift-card' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    name: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pin: { type: String },
    email: { type: String },
    shippingAddress: { type: String },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

prizeClaimSchema.index({ winnerId: 1 }, { unique: true, sparse: true });

export default mongoose.model('PrizeClaim', prizeClaimSchema);
