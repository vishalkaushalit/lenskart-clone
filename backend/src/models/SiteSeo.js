import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'site' },
  websiteUrl: { type: String, default: '', maxlength: 2000 },
  googleVerification: { type: String, default: '', maxlength: 500 },
  metaVerification: { type: String, default: '', maxlength: 500 },
  sitemap: { type: String, default: '', maxlength: 200000 },
  robots: { type: String, default: '', maxlength: 100000 },
}, { timestamps: true });
export default mongoose.model('SiteSeo', schema);
