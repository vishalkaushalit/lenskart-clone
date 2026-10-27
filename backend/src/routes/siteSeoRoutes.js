import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import SiteSeo from '../models/SiteSeo.js';
import Product from '../models/Product.js';
import { editableStorePages } from '../../../shared/storePages.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { escapeXml, siteSeoFields, verificationHtml } from '../services/siteSeo.js';
export const adminSiteSeo = express.Router();
export const publicSiteSeo = express.Router();
adminSiteSeo.use(requireAuth,requireRole('admin'));
const settings = async () => await SiteSeo.findOne({key:'site'}).lean() || {};
adminSiteSeo.get('/', async (req,res) => res.json({settings:await settings()}));
adminSiteSeo.put('/', async (req,res) => {
  let fields;
  try { fields=siteSeoFields(req.body || {}); } catch(error) { return res.status(400).json({message:error.message}); }
  const result=await SiteSeo.findOneAndUpdate({key:'site'},{$set:fields},{upsert:true,new:true,runValidators:true});
  res.json({settings:result});
});
publicSiteSeo.get('/settings', async (req,res) => {
  const value=await settings();
  res.json({googleVerification:value.googleVerification || '',metaVerification:value.metaVerification || '',trackingMode:value.trackingMode || 'off',gtmId:value.gtmId || '',ga4Id:value.ga4Id || '',googleAdsId:value.googleAdsId || ''});
});
function origin(value,req) {
  return value.websiteUrl || process.env.FRONTEND_URL?.replace(/\/$/,'') || `${req.protocol}://${req.get('host')}`;
}
publicSiteSeo.get('/robots.txt', async (req,res) => {
  const value=await settings();
  res.type('text/plain').set('Cache-Control','public, max-age=60').send(value.robots || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /cart\nDisallow: /checkout\nDisallow: /profile\nSitemap: ${origin(value,req)}/sitemap.xml\n`);
});
publicSiteSeo.get('/sitemap.xml', async (req,res) => {
  const value=await settings();
  if(value.sitemap) return res.type('application/xml').send(value.sitemap);
  const products=await Product.find({status:'active'}).select('slug updatedAt').limit(49900).lean();
  const base=origin(value,req);
  const rows=[...editableStorePages.filter(page=>!page.noindex).map(page=>({path:page.path})),...products.filter(product=>product.slug).map(product=>({path:`/products/${product.slug}`,updatedAt:product.updatedAt}))];
  const xml=rows.map(row=>`<url><loc>${escapeXml(base+row.path)}</loc>${row.updatedAt?`<lastmod>${new Date(row.updatedAt).toISOString()}</lastmod>`:''}</url>`).join('\n');
  res.type('application/xml').set('Cache-Control','public, max-age=60').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>`);
});
publicSiteSeo.get('/home', async (req,res) => {
  const value=await settings();
  let html;
  for(const file of ['dist/index.html','frontend/dist/index.html']) {
    try { html=await readFile(resolve(process.cwd(),file),'utf8');break; } catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  if(!html) return res.status(503).type('text/plain').send('Build the storefront before serving the homepage.');
  res.type('html').set('Cache-Control','no-store').send(html.replace('</head>',`${verificationHtml(value)}\n</head>`));
});
