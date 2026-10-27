import { prefixRoutes, resolveStorePath, customRedirectRoutes, redirectTarget } from '../../../shared/urlPrefixes.js';
import PageSeo from '../models/PageSeo.js';
import { sitemapPages, pageNoindex } from '../../../shared/indexing.js';
import express from 'express';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import SiteSeo from '../models/SiteSeo.js';
import Product from '../models/Product.js';
import { editableStorePages, storePages } from '../../../shared/storePages.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { escapeXml, siteSeoFields, storefrontHtml } from '../services/siteSeo.js';
export const adminSiteSeo = express.Router();
export const publicSiteSeo = express.Router();
adminSiteSeo.use(requireAuth,requireRole('admin'));
const settings = async () => await SiteSeo.findOne({key:'site'}).lean() || {};
adminSiteSeo.get('/', async (req,res) => res.json({settings:await settings()}));
adminSiteSeo.delete('/redirects', async (req,res) => {
  const from=req.query.from;
  if(typeof from!=='string'||from.length>300||!/^\/(?:[a-zA-Z0-9_%.-]+|:[a-zA-Z][a-zA-Z0-9]*)(?:\/(?:[a-zA-Z0-9_%.-]+|:[a-zA-Z][a-zA-Z0-9]*))*$/.test(from)||from.split('/').some(part=>part==='.'||part==='..')||/^\/(api|admin|assets)(?:\/|$)/.test(from))return res.status(400).json({message:'Choose a valid automatic redirect.'});
  const site=await settings();
  const productPrefix=(site.productPrefixHistory||[]).find(prefix=>from===`${prefix}/:id`||from===`${prefix}/:id/reviews`);
  const collectionPrefix=(site.collectionPrefixHistory||[]).find(prefix=>from===prefix);
  if(productPrefix||collectionPrefix) {
    const field=productPrefix?'productPrefixHistory':'collectionPrefixHistory';
    const prefix=productPrefix||collectionPrefix;
    const updated=await SiteSeo.findOneAndUpdate({key:'site'},{$pull:{[field]:prefix}},{new:true});
    if(!updated)return res.status(404).json({message:'Automatic redirect not found.'});
    return res.json({removed:from});
  }
  const pageRedirect=await PageSeo.findOne({redirects:from}).lean();
  if(pageRedirect) {
    const updated=await PageSeo.findOneAndUpdate({path:pageRedirect.path},{$pull:{redirects:from}},{new:true});
    if(!updated)return res.status(404).json({message:'Automatic redirect not found.'});
    return res.json({removed:from});
  }
  const page=await PageSeo.findOne({path:from}).lean();
  if(page?.redirectOld&&(page.urlPath||page.path)!==from) {
    const updated=await PageSeo.findOneAndUpdate({path:page.path},{$set:{redirectOld:false}},{new:true});
    if(!updated)return res.status(404).json({message:'Automatic redirect not found.'});
    return res.json({removed:from});
  }
  return res.status(404).json({message:'Automatic redirect not found.'});
});
adminSiteSeo.put('/', async (req,res) => {
  let fields;
  try { fields=siteSeoFields(req.body || {}); } catch(error) { return res.status(400).json({message:error.message}); }
  const previous=await settings();
  const merged={...previous,...fields};
  const product=merged.productPrefix || '/products', collection=merged.collectionPrefix || '/collections';
  const products=new Set(['/products',previous.productPrefix,product,...(previous.productPrefixHistory || [])]);
  const collections=new Set(['/collection',previous.collectionPrefix,collection,...(previous.collectionPrefixHistory || [])]);
  if ([...products].some(prefix=>prefix&&collections.has(prefix))) return res.status(409).json({message:'Product and collection prefixes must be different, including previous prefixes.'});
  const pages=await PageSeo.find({}).select('path urlPath redirects').lean();
  if (pages.some(row=>row.path!=='/collection'&&[row.urlPath,...(row.redirects || [])].filter(Boolean).some(path=>[product,collection].some(prefix=>path===prefix||path.startsWith(prefix+'/'))))) return res.status(409).json({message:'This prefix conflicts with a saved page URL.'});
  for (const [key,fallback] of [['productPrefix','/products'],['collectionPrefix','/collections']]) {
    if (fields[key] && fields[key] !== (previous[key] || fallback)) fields[key+'History']=[...new Set([...(previous[key+'History'] || []),previous[key] || fallback])].filter(value=>value!==fields[key]);
  }
  try {
    const routes=[...customRedirectRoutes(merged),...prefixRoutes({...merged,productPrefixHistory:fields.productPrefixHistory || merged.productPrefixHistory,collectionPrefixHistory:fields.collectionPrefixHistory || merged.collectionPrefixHistory},pages),...pages];
    for (const row of routes) redirectTarget(row.path,routes);
  } catch(error) { return res.status(400).json({message:error.message}); }
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
  res.type('text/plain').set('Cache-Control','public, max-age=60').send(value.robots || `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${origin(value,req)}/sitemap.xml\n`);
});
publicSiteSeo.get('/sitemap.xml', async (req,res) => {
  const value=await settings();
  if(value.sitemap) return res.type('application/xml').send(value.sitemap);
  const products=await Product.find({status:'active'}).select('slug updatedAt seoNoindex').limit(49900).lean();
  const overrides=await PageSeo.find({}).select('path noindex urlPath redirectOld redirects -_id').lean();
  const base=origin(value,req);
  const rows=[...sitemapPages(editableStorePages,overrides.map(row=>row.path==='/collection'?{...row,urlPath:prefixRoutes(value,overrides)[2].urlPath}:row)).map(page=>({path:page.path==='/collection'?(value.collectionPrefix || '/collections'):page.path})),...products.filter(product=>product.slug&&!pageNoindex(product.seoNoindex,overrides.find(row=>row.path===`/products/${product.slug}`)?.noindex)).map(product=>({path:`${value.productPrefix || "/products"}/${product.slug}`,updatedAt:product.updatedAt}))];
  const xml=rows.map(row=>`<url><loc>${escapeXml(base+row.path)}</loc>${row.updatedAt?`<lastmod>${new Date(row.updatedAt).toISOString()}</lastmod>`:''}</url>`).join('\n');
  res.type('application/xml').set('Cache-Control','public, max-age=60').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${xml}\n</urlset>`);
});
export async function renderStorefront(req,res) {
  const requested=req.storefrontPath || '/';
  const value=await settings();
  const overrides=await PageSeo.find({}).select('path noindex urlPath redirectOld redirects title description -_id').lean();
  const customTarget=redirectTarget(requested,[...customRedirectRoutes(value),...prefixRoutes(value,overrides),...overrides]);
  if(customTarget!==requested) {
    const query=req.originalUrl?.includes('?')?'?'+req.originalUrl.split('?').slice(1).join('?'):'';
    return res.redirect(301,customTarget+query);
  }
  const prefixed=resolveStorePath(requested,prefixRoutes(value,overrides));
  if(prefixed.destination!==requested) {
    const query=req.originalUrl?.includes('?')?'?'+req.originalUrl.split('?').slice(1).join('?'):'';
    return res.redirect(301,prefixed.destination+query);
  }
  const seo=overrides.find(row=>row.path===prefixed.path||row.urlPath===requested||row.redirects?.includes(requested));
  const pagePath=seo?.path || prefixed.path;
  const destination=prefixed.row ? prefixed.destination : seo?.urlPath || pagePath;
  if(seo&&requested!==destination&&(seo.redirectOld||seo.redirects?.includes(requested))) {
    const query=req.originalUrl?.includes('?')?'?'+req.originalUrl.split('?').slice(1).join('?'):'';
    return res.redirect(301,destination+query);
  }
  let html;
  for(const file of ['dist/index.html','frontend/dist/index.html']) {
    try { html=await readFile(resolve(process.cwd(),file),'utf8');break; } catch(error) { if(error.code!=='ENOENT') throw error; }
  }
  if(!html)return res.status(503).type('text/plain').send('Build the storefront before serving pages.');
  const registered=storePages.find(page=>new RegExp('^'+page.path.replace(/:[^/]+/g,'[^/]+')+'$').test(pagePath)) || (pagePath.startsWith('/collection/')?storePages.find(page=>page.path==='/collection'):null);
  const productMatch=pagePath.match(/^\/products\/([^/]+)(?:\/reviews)?$/);
  const product=productMatch?await Product.findOne({status:'active',$or:[{slug:productMatch[1]},...(/^[a-f0-9]{24}$/i.test(productMatch[1])?[{_id:productMatch[1]}]:[])]}).select('name seoNoindex seoTitle seoDescription').lean():null;
  const missing=!registered||(productMatch&&!product);
  const noindex=Boolean(missing)||pageNoindex(product?.seoNoindex,pageNoindex(seo?.noindex,registered?.noindex ?? registered?.protected));
  if(noindex)res.set('X-Robots-Tag','noindex, follow');
  html=html.replace('</head>',`<meta name="robots" content="${noindex?'noindex':'index'}, follow" />\n</head>`);
  const title=product?.seoTitle || seo?.title || product?.name || registered?.title;
  const description=product?.seoDescription || seo?.description || registered?.description;
  if(title)html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${escapeXml(title)} | Lenskart Clone</title>`);
  if(description)html=html.replace(/<meta name="description" content="[^"]*"\s*\/?>/,`<meta name="description" content="${escapeXml(description)}" />`);
  const products=requested==='/'?await Product.find({status:'active'}).select('slug name seoNoindex').limit(1000).lean():[];
  const pages=sitemapPages(editableStorePages,overrides.map(row=>row.path==='/collection'?{...row,urlPath:prefixRoutes(value,overrides)[2].urlPath}:row)).map(page=>({path:page.path==='/collection'?(value.collectionPrefix || '/collections'):page.path,label:page.label}));
  const links=[...pages,...products.filter(product=>product.slug&&!product.seoNoindex).map(product=>({path:`${value.productPrefix || "/products"}/${product.slug}`,label:product.name || product.slug}))];
  res.status(missing?404:200).type('html').set('Cache-Control','no-store').send(storefrontHtml(html,value,links));
}
publicSiteSeo.get('/home',renderStorefront);
