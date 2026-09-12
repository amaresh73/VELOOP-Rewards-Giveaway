import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    action: { type: String, required: true },
    performedBy: { type: String },
    userId: { type: String },
    giveawayId: { type: String },
    amount: { type: Number, default: 0 },
    currency: { type: String },
    result: { type: String, enum: ['SUCCESS', 'BLOCKED', 'FLAGGED', 'REJECTED', 'PENDING'], default: 'SUCCESS' },
    requestId: { type: String },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
