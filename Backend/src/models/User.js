import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    externalId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, sparse: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, sparse: true, unique: true, trim: true, index: true },
    passwordHash: { type: String, select: false },
    role: { type: String, enum: ['member', 'admin'], default: 'member' },
    verified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);