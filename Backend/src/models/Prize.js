import mongoose from 'mongoose';

const prizeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['gift-card', 'physical', 'cash', 'tech'], default: 'gift-card' },
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  { timestamps: true }
);

export default mongoose.model('Prize', prizeSchema);
