import express from 'express';
import PageSeo from '../models/PageSeo.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const publicSeo = express.Router();
export const adminSeo = express.Router();
adminSeo.use(requireAuth, requireRole('admin'));

function validPath(path) {
  return typeof path === 'string' && path.length <= 300 && /^\/(?:[a-zA-Z0-9_%.-]+(?:\/[a-zA-Z0-9_%.-]+)*)?$/.test(path) && !path.split('/').some(part => part === '.' || part === '..');
}

async function read(req, res) {
  if (!validPath(req.query.path)) return res.status(400).json({ message: 'Enter a page path without a query or trailing slash, such as /collection.' });
  res.json({ seo: await PageSeo.findOne({ path: req.query.path }).select('path title description image keywords faqs -_id').lean() });
}
publicSeo.get('/', read);
adminSeo.get('/', read);
adminSeo.put('/', async (req, res) => {
  const { path, title = '', description = '', image = '' } = req.body || {};
  if (!validPath(path)) return res.status(400).json({ message: 'Enter a valid page path without query parameters or a trailing slash.' });
  for (const [value, limit] of [[title, 120], [description, 320], [image, 2000]]) {
    if (typeof value !== 'string' || value.length > limit) return res.status(400).json({ message: 'Check the SEO field lengths.' });
  }
  const extras = {};
  if (Object.hasOwn(req.body, 'keywords')) {
    if (typeof req.body.keywords !== 'string' || req.body.keywords.length > 1000) return res.status(400).json({ message: 'Keywords must be text up to 1000 characters.' });
    extras.keywords = req.body.keywords.trim();
  }
  if (Object.hasOwn(req.body, 'faqs')) {
    if (!Array.isArray(req.body.faqs) || req.body.faqs.length > 20 || req.body.faqs.some(faq => !faq || typeof faq.question !== 'string' || !faq.question.trim() || faq.question.length > 200 || typeof faq.answer !== 'string' || !faq.answer.trim() || faq.answer.length > 1000)) return res.status(400).json({ message: 'Add up to 20 FAQs with a question (200 characters) and answer (1000 characters).' });
    extras.faqs = req.body.faqs.map(({ question, answer }) => ({ question: question.trim(), answer: answer.trim() }));
  }
  if (image.trim() && !/^\/assets\/products\/[\w.-]+$/.test(image.trim())) {
    try {
      if (!['http:', 'https:'].includes(new URL(image.trim()).protocol)) throw new Error();
    } catch { return res.status(400).json({ message: 'Use a full HTTP or HTTPS image URL.' }); }
  }
  const seo = await PageSeo.findOneAndUpdate({ path }, { $set: { ...extras, title: title.trim(), description: description.trim(), image: image.trim() } }, { upsert: true, new: true, runValidators: true });
  res.json({ seo });
});
