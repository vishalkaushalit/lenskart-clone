import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  path: { type: String, required: true, unique: true, maxlength: 300 },
  title: { type: String, trim: true, maxlength: 120, default: '' },
  description: { type: String, trim: true, maxlength: 320, default: '' },
  image: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true });

export default mongoose.model('PageSeo', schema);
