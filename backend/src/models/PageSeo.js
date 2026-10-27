import mongoose from 'mongoose';

const schema = new mongoose.Schema(
  {
    path: { type: String, required: true, unique: true, maxlength: 300 },
    title: { type: String, trim: true, maxlength: 120, default: '' },
    description: { type: String, trim: true, maxlength: 320, default: '' },
    urlPath: { type: String, default: '', maxlength: 300 },
    redirectOld: { type: Boolean, default: true },
    redirects: { type: [String], default: [] },
    noindex: { type: Boolean, default: null },
    keywords: { type: String, trim: true, maxlength: 1000, default: '' },
    faqs: {
      type: [
        {
          question: { type: String, required: true, trim: true, maxlength: 200 },
          answer: { type: String, required: true, trim: true, maxlength: 1000 },
        },
      ],
      default: [],
      validate: (rows) => rows.length <= 20,
    },
    image: { type: String, trim: true, maxlength: 2000, default: '' },
  },
  { timestamps: true },
);

schema.index({ urlPath: 1 }, { unique: true, partialFilterExpression: { urlPath: { $gt: '' } } });

export default mongoose.model('PageSeo', schema);
