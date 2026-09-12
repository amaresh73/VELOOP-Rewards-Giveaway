import mongoose from 'mongoose';

const fraudEventSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', index: true },
    deviceHash: { type: String, index: true },
    riskScore: { type: Number, default: 0 },
    eventType: {
      type: String,
      enum: ['DUPLICATE_REQUEST', 'INSUFFICIENT_BALANCE', 'GIVEAWAY_ENDED', 'UNAUTHORIZED', 'SUSPICIOUS_DEVICE', 'RATE_LIMIT', 'MULTI_ACCOUNT', 'REPEATED_ATTEMPT', 'DEVICE_MATCH'],
      required: true
    },
    severity: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' },
    reason: { type: String, required: true },
    signals: { type: [String], default: [] },
    action: { type: String, enum: ['BLOCKED', 'FLAGGED', 'REVIEW', 'ALLOWED'], default: 'FLAGGED' },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model('FraudEvent', fraudEventSchema);
