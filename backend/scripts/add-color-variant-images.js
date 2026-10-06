import 'dotenv/config';
import mongoose from 'mongoose';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import Product from '../src/models/Product.js';
import ProductVariant from '../src/models/ProductVariant.js';
import { imageExtension } from '../src/services/productImages.js';

// Demo photos match color and frame shape; some colors use a similar model.
// Galleries are shared by sizes of the same color. Prices and inventory are untouched.
const directory = new URL('../public/products/', import.meta.url);
const manifestPath = new URL('color-variant-image-sources.json', directory);
const runFile = promisify(execFile);
const sources = {
  'square-blue': ['Blue', 'Square', 'lenskart-air-la-e16718-c4-eyeglasses.html'],
  'square-grey': ['Grey', 'Square', 'lenskart-air-la-e19137-grey-eyeglasses.html'],
  'rectangle-blue': ['Blue', 'Rectangle', 'lenskart-air-lae000237-c2-eyeglasses.html'],
  'geometric-black': ['Black', 'Geometric', 'vincent-chase-vce000096-c2-new-2-eye.html'],
  'geometric-blue': ['Blue', 'Geometric', 'lenskart-air-lae000634-c2-eyeglasses.html'],
  'round-black': ['Black', 'Round', 'black-full-rim-round-small-size-49-vincent-chase-steel-escobar-vc-e12423-c1-eyeglasses.html'],
  'round-blue': ['Blue', 'Round', 'vincent-chase-vc-e15960-c2-eyeglasses.html'],
  'round-grey': ['Grey', 'Round', 'lenskart-air-la-e16239-c1-eyeglasses.html'],
  'round-red': ['Red', 'Round', 'lenskart-air-la-e13035-c3-eyeglasses.html'],
  'aviator-black': ['Black', 'Aviator', 'john-jacobs-jj-e13192-c1-eyeglasses.html'],
  'aviator-blue': ['Blue', 'Aviator', 'john-jacobs-jj-e13192-c4-eyeglasses.html'],
  'cat-eye-black': ['Black', 'Cat Eye', 'lenskart-air-la-e18782-black-eyeglasses.html'],
  'cat-eye-blue': ['Blue', 'Cat Eye', 'john-jacobs-jj-e70181-c2-eyeglasses.html'],
  'clubmaster-blue': ['Blue', 'Clubmaster', 'john-jacobs-jj-e70287-c2-eyeglasses.html'],
};
const assignments = {
  'frame-1': {Black:'frame-1', Blue:'square-blue', Grey:'square-grey'},
  'frame-2': {Black:'frame-2', Blue:'rectangle-blue'},
  'frame-3': {Grey:'frame-3', Black:'geometric-black', Blue:'geometric-blue'},
  'frame-4': {Gold:'frame-4', Black:'round-black', Blue:'round-blue'},
  'frame-5': {Gold:'frame-5', Black:'aviator-black', Blue:'aviator-blue'},
  'frame-6': {Pink:'frame-6', Black:'cat-eye-black', Blue:'cat-eye-blue'},
  'frame-7': {Black:'frame-7', Blue:'clubmaster-blue'},
  'frame-8': {Brown:'frame-8', Black:'frame-1', Blue:'square-blue'},
  'frame-9': {Grey:'round-grey', red:'round-red', Black:'round-black'},
};
async function request(url,partialHtml=false) {
  for(let attempt=0;attempt<3;attempt++) {
    try {
      const {stdout}=await runFile('curl',['--fail','--silent','--show-error','--location','--max-time','20',url],{encoding:'buffer',maxBuffer:20*1024*1024});
      return {text:async()=>stdout.toString('utf8'),arrayBuffer:async()=>stdout};
    }catch(error){
      // The source streams optional page widgets slowly. Complete metadata/photos
      // in a partial HTML response are usable; binary downloads must finish.
      if(partialHtml&&error.code===28&&error.stdout?.includes(Buffer.from('alt="Product 3"'))) return {text:async()=>error.stdout.toString('utf8')};
      if(attempt===2) throw new Error(`Download failed: ${url}: ${error.message.split('\n')[0]}`);
    }
  }
}
if (!process.argv.includes('--apply')) {
  await mkdir(directory,{recursive:true});
  const originals=JSON.parse(await readFile(new URL('sample-image-sources.json',directory),'utf8'));
  const galleries=new Map(originals.map(entry=>[entry.sku,entry]));
  // Finish validating every download before permitting any database write.
  const entries=Object.entries(sources);
  let cursor=0;
  await Promise.all(Array.from({length:3},async()=>{
    while(cursor<entries.length){
      const [key,[color,shape,path]]=entries[cursor++];
      const page=`https://www.lenskart.com/${path}`;
      const html=await (await request(page,true)).text();
      const data=JSON.parse(html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s)?.[1]||'{}');
      const widgets=data.props?.pageProps?.data?.productDetailData?.result||[];
      const title=widgets.find(row=>row.id==='summary')?.data?.description||html.match(/<meta\b[^>]*property="og:title"[^>]*content="([^"]+)"/)?.[1]||'';
      const colorPattern=color==='Grey'?/gr[ae]y/i:new RegExp(color,'i');
      if(!colorPattern.test(title)) throw new Error(`Wrong source color for ${key}: ${title}`);
      if(!title.toLowerCase().replaceAll('-',' ').includes(shape.toLowerCase())) throw new Error(`Wrong source shape for ${key}: ${title}`);
      const urls=[...new Set([...html.matchAll(/<img\b[^>]*alt="Product \d+"[^>]*>/g)].map(([tag])=>tag.match(/\bsrc="([^"]+)"/)?.[1]?.replaceAll('&amp;','&')).filter(Boolean))].slice(0,4);
      if(urls.length<3) throw new Error(`Not enough photos for ${key}`);
      const images=[];
      for(const [index,source] of urls.entries()) {
        const buffer=Buffer.from(await (await request(source)).arrayBuffer());
        const extension=imageExtension(buffer);
        if(!extension) throw new Error(`Invalid image: ${source}`);
        const filename=`variant-${key}-${index+1}.${extension}`;
        await writeFile(new URL(filename,directory),buffer);
        images.push({local:`/assets/products/${filename}`,source});
      }
      galleries.set(key,{page,color,shape,title,images});
      console.log(`Downloaded ${key}: ${title} (${images.length} photos)`);
    }
  }));
  const manifest=Object.entries(assignments).flatMap(([sku,colors])=>Object.entries(colors).map(([color,key])=>({...galleries.get(key),sku,color})));
  await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
  console.log(`Prepared ${manifest.length} product/color galleries. Run with --apply to update the database.`);
} else {
  const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
  for(const entry of manifest) for(const image of entry.images) {
    const buffer=await readFile(new URL(image.local.replace('/assets/products/',''),directory));
    if(!imageExtension(buffer)) throw new Error(`Invalid local photo ${image.local}`);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
    const session=await mongoose.startSession();
    let updated=0;
    try {await session.withTransaction(async()=>{
      updated=0;
      for(const entry of manifest) {
        const product=await Product.findOne({sku:entry.sku}).session(session);
        if(!product) throw new Error(`Missing product ${entry.sku}`);
        const variants=await ProductVariant.find({productId:product._id}).session(session);
        const matching=variants.filter(variant=>variant.color.trim().toLowerCase()===entry.color.toLowerCase());
        if(!matching.length) throw new Error(`Missing ${entry.sku} ${entry.color} variants`);
        const images=entry.images.map(image=>image.local);
        const result=await ProductVariant.updateMany({_id:{$in:matching.map(variant=>variant._id)}},{$set:{images}},{session});
        updated+=result.matchedCount;
        // Correct the grey round product's old gold gallery to match its default color.
        if(entry.sku==='frame-9'&&entry.color==='Grey') {
          product.image=images[0];product.images=images;
          for(const [index,key] of ['material','hinge','temple','nosepad'].entries()) {
            if(!product.highlightImages[key]||product.highlightImages[key].includes('sample-frame-9-')) product.highlightImages[key]=images[index]||images[0];
          }
          await product.save({session});
        }
      }
    });}finally{await session.endSession();}
    let verified=0;
    for(const entry of manifest) {
      const product=await Product.findOne({sku:entry.sku}).lean();
      const variants=await ProductVariant.find({productId:product._id}).lean();
      for(const variant of variants.filter(row=>row.color.trim().toLowerCase()===entry.color.toLowerCase())) {
        if(JSON.stringify(variant.images)!==JSON.stringify(entry.images.map(image=>image.local))) throw new Error(`Verification failed: ${variant._id}`);
        verified++;
      }
    }
    console.log(JSON.stringify({updatedVariants:updated,verifiedVariants:verified,colorGalleries:manifest.length}));
  }finally{await mongoose.disconnect();}
}
