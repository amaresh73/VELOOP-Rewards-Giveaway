import mongoose from 'mongoose';

const deviceParticipationSchema = new mongoose.Schema(
  {
    giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', required: true, index: true },
    deviceHash: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    status: { type: String, enum: ['ACTIVE', 'BLOCKED', 'REVIEW', 'FLAGGED'], default: 'ACTIVE' },
    riskScore: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

deviceParticipationSchema.index({ giveawayId: 1, deviceHash: 1 }, { unique: true });

deviceParticipationSchema.index({ giveawayId: 1, userId: 1 }, { unique: true });

export default mongoose.model('DeviceParticipation', deviceParticipationSchema);
