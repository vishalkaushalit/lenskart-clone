import mongoose from 'mongoose';
const schema = new mongoose.Schema(
  {
    redirects: { type: [{ _id: false, from: String, to: String }], default: [] },
    productPrefix: { type: String, default: '/products' },
    collectionPrefix: { type: String, default: '/collection' },
    productPrefixHistory: { type: [String], default: [] },
    collectionPrefixHistory: { type: [String], default: [] },
    key: { type: String, unique: true, default: 'site' },
    websiteUrl: { type: String, default: '', maxlength: 2000 },
    googleVerification: { type: String, default: '', maxlength: 500 },
    metaVerification: { type: String, default: '', maxlength: 500 },
    trackingMode: { type: String, enum: ['off', 'gtm', 'direct'], default: 'off' },
    gtmId: { type: String, default: '', maxlength: 40 },
    ga4Id: { type: String, default: '', maxlength: 40 },
    googleAdsId: { type: String, default: '', maxlength: 40 },
    sitemap: { type: String, default: '', maxlength: 200000 },
    robots: { type: String, default: '', maxlength: 100000 },
  },
  { timestamps: true },
);
export default mongoose.model('SiteSeo', schema);
