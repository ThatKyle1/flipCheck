import mongoose from 'mongoose';

const lookupSchema = new mongoose.Schema({
  description: { type: String, required: true },
  resaleValue: { type: Number, required: true },
  recommendation: { type: String, enum: ['Buy', 'Pass', 'Maybe'], required: true },
  reasoning: { type: String, required: true },
  purchasePrice: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model('Lookup', lookupSchema);
