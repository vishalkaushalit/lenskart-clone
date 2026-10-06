import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
import ProductVariant from '../src/models/ProductVariant.js';

// Add missing combinations only. Existing variant prices, images and stock stay intact.
const dryRun=process.argv.includes('--dry-run');
const key=(size,color)=>`${size}:${color.trim().toLowerCase()}`;
try {
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
 await ProductVariant.init();
 const products=await Product.find({}).sort({createdAt:1,_id:1}).lean();
 const results=[];
 for(const snapshot of products){
  const session=await mongoose.startSession();
  let result;
  try {await session.withTransaction(async()=>{
   const product=await Product.findById(snapshot._id).session(session);
   if(!product)return;
   const existing=await ProductVariant.find({productId:product._id}).session(session).lean();
   const colors=[...new Map([product.color,...existing.map(row=>row.color),...(product.availableColors||[]),'Black','Blue'].filter(Boolean).map(color=>[color.trim().toLowerCase(),color.trim()])).values()].slice(0,3);
   const combinations=colors.flatMap(color=>['S','M','L'].map(size=>({size,color})));
   const identities=new Set(existing.map(row=>key(row.size,row.color)));
   const legacy=!product.hasVariants&&!existing.length;
   const stock=Number.isSafeInteger(product.stock)?product.stock:0;
   const missing=combinations.flatMap((combination,index)=>identities.has(key(combination.size,combination.color))?[]:[{
    ...combination,productId:product._id,price:product.price,originalPrice:Math.max(product.price,product.originalPrice??product.price),
    stock:legacy?Math.floor(stock/combinations.length)+(index<stock%combinations.length?1:0):10,
    images:product.images?.length?[...product.images]:[product.image],status:'active',
   }]);
   if(!dryRun){if(missing.length)await ProductVariant.create(missing,{session,ordered:true});if(!product.hasVariants){product.hasVariants=true;await product.save({session});}}
   result={product:product.name,added:missing.length,existing:existing.length,colors,sizes:['S','M','L'],totalStock:existing.filter(row=>row.status==='active').reduce((sum,row)=>sum+row.stock,0)+missing.reduce((sum,row)=>sum+row.stock,0)};
  });if(result)results.push(result);}finally{await session.endSession();}
 }
 console.log(JSON.stringify({dryRun,products:results.length,added:results.reduce((sum,row)=>sum+row.added,0),results},null,2));
} finally {await mongoose.disconnect();}
