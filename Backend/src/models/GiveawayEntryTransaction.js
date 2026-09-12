import mongoose from 'mongoose';

const giveawayEntryTransactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    giveawayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Giveaway', required: true, index: true },
    prizeId: { type: String },
    currency: { type: String, enum: ['VEs', 'SVEs', 'Tokens'], required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['ENTRY_DEBIT', 'REVERSAL', 'ENTRY_REFUND', 'WINNER_CLAIM'], default: 'ENTRY_DEBIT' },
    relatedTransactionId: { type: String, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REVERSED'],
      default: 'SUCCESS'
    },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    transactionId: { type: String, required: true, unique: true },
    requestKey: { type: String, index: true },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model('GiveawayEntryTransaction', giveawayEntryTransactionSchema);
