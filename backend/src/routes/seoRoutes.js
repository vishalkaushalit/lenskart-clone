import SiteSeo from '../models/SiteSeo.js';
import { prefixRoutes, customRedirectRoutes } from '../../../shared/urlPrefixes.js';
import { editableStorePages } from '../../../shared/storePages.js';
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
  res.json({ seo: await PageSeo.findOne({ path: req.query.path }).select('path title description image keywords faqs noindex urlPath redirectOld redirects -_id').lean() });
}
adminSeo.get('/all', async (req,res) => res.json({ pages: await PageSeo.find({}).select('path noindex urlPath redirectOld redirects -_id').lean() }));
publicSeo.get('/routes', async(req,res)=>{
  const pages=await PageSeo.find({$or:[{urlPath:{$nin:['',null]}},{'redirects.0':{$exists:true}}]}).select('path urlPath redirectOld redirects -_id').lean();
  const site=await SiteSeo.findOne({key:'site'}).lean() || {};
  res.json({pages:[...customRedirectRoutes(site),...prefixRoutes(site,pages),...pages.filter(row=>row.path!=='/collection')]});
});
publicSeo.get('/', read);
adminSeo.get('/', read);
adminSeo.put('/', async (req, res) => {
  const { path, title = '', description = '', image = '' } = req.body || {};
  if (!validPath(path)) return res.status(400).json({ message: 'Enter a valid page path without query parameters or a trailing slash.' });
  for (const [value, limit] of [[title, 120], [description, 320], [image, 2000]]) {
    if (typeof value !== 'string' || value.length > limit) return res.status(400).json({ message: 'Check the SEO field lengths.' });
  }
  const extras = {};
  if (Object.hasOwn(req.body, 'noindex')) {
    if (typeof req.body.noindex !== 'boolean') return res.status(400).json({ message: 'Choose a valid indexing setting.' });
    extras.noindex = req.body.noindex;
  }
  if (Object.hasOwn(req.body, 'keywords')) {
    if (typeof req.body.keywords !== 'string' || req.body.keywords.length > 1000) return res.status(400).json({ message: 'Keywords must be text up to 1000 characters.' });
    extras.keywords = req.body.keywords.trim();
  }
  if (Object.hasOwn(req.body, 'faqs')) {
    if (!Array.isArray(req.body.faqs) || req.body.faqs.length > 20 || req.body.faqs.some(faq => !faq || typeof faq.question !== 'string' || !faq.question.trim() || faq.question.length > 200 || typeof faq.answer !== 'string' || !faq.answer.trim() || faq.answer.length > 1000)) return res.status(400).json({ message: 'Add up to 20 FAQs with a question (200 characters) and answer (1000 characters).' });
    extras.faqs = req.body.faqs.map(({ question, answer }) => ({ question: question.trim(), answer: answer.trim() }));
  }
  if (Object.hasOwn(req.body,'urlPath')) {
    const requested=req.body.urlPath;
    if(!validPath(requested)||!editableStorePages.some(page=>page.path===path))return res.status(400).json({message:'Choose a valid URL path for a registered page.'});
    if(typeof req.body.redirectOld!=='boolean')return res.status(400).json({message:'Choose whether to redirect the old URL.'});
    if(requested!==path && (editableStorePages.some(page=>page.path===requested)||/^\/(api|admin|assets|products|orders|thank-you)(?:\/|$)/.test(requested)||['/robots.txt','/sitemap.xml','/index.html','/favicon.ico','/favicon.svg'].includes(requested)))return res.status(400).json({message:'This URL is reserved or belongs to another page.'});
    const site=await SiteSeo.findOne({key:'site'}).lean() || {};
    const reservedPrefixes=[site.productPrefix || '/products',...(site.productPrefixHistory || []),site.collectionPrefix || '/collection',...(site.collectionPrefixHistory || [])];
    if(path!=='/collection'&&reservedPrefixes.some(prefix=>requested===prefix||requested.startsWith(prefix+'/')))return res.status(409).json({message:'This URL is reserved for products or collections.'});
    if(path==='/collection'&&site.collectionPrefix&&requested!==site.collectionPrefix&&requested!==path)return res.status(400).json({message:'Manage the collection URL prefix in Settings.'});
    const conflict=await PageSeo.findOne({path:{$ne:path},$or:[{urlPath:requested},{redirects:requested}]}).lean();
    if(conflict)return res.status(409).json({message:'This URL is already used by another page.'});
    const existing=await PageSeo.findOne({path}).lean();
    const previous=existing?.urlPath || path;
    extras.urlPath=requested===path?'':requested;
    extras.redirectOld=req.body.redirectOld;
    extras.redirects=req.body.redirectOld?[...new Set([...(existing?.redirects || []),...(previous!==requested?[previous]:[])])].filter(value=>value!==requested):[];
  }
  if (image.trim() && !/^\/assets\/products\/[\w.-]+$/.test(image.trim())) {
    try {
      if (!['http:', 'https:'].includes(new URL(image.trim()).protocol)) throw new Error();
    } catch { return res.status(400).json({ message: 'Use a full HTTP or HTTPS image URL.' }); }
  }
  let seo;
  try { seo = await PageSeo.findOneAndUpdate({ path }, { $set: { ...extras, title: title.trim(), description: description.trim(), image: image.trim() } }, { upsert: true, new: true, runValidators: true }); } catch(error) { if(error.code===11000)return res.status(409).json({message:'This page URL is already used.'});throw error; }
  res.json({ seo });
});
