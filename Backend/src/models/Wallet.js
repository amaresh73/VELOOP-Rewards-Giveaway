import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    balances: {
      VEs: { type: Number, default: 350, min: 0 },
      SVEs: { type: Number, default: 1200, min: 0 },
      Tokens: { type: Number, default: 2500, min: 0 }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Wallet', walletSchema);