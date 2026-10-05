import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
try {
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});await Category.init();
 const products=await Product.find().lean();
 const shapes=[...new Set(products.map(product=>product.shape?.trim()).filter(Boolean))];
 const roots=await Category.find({parent:null});let linked=0;
 for(const root of roots){
  const children=new Map();
  for(const shape of shapes){const child=await Category.findOneAndUpdate({name:shape,parent:root._id},{$setOnInsert:{name:shape,parent:root._id,active:true}},{upsert:true,returnDocument:'after'});children.set(shape,child._id);}
  for(const product of products){
   const belongs=(product.categoryIds||[]).some(id=>String(id)===String(root._id))||String(product.categoryId)===String(root._id)||(!product.categoryId&&!product.categoryIds?.length&&product.productType===root.name);
   const child=children.get(product.shape?.trim());if(!belongs||!child)continue;
   const existingRoots=product.categoryIds?.length?product.categoryIds:product.categoryId?[product.categoryId]:[];
   const existingChildren=product.subcategoryIds?.length?product.subcategoryIds:product.subcategoryId?[product.subcategoryId]:[];
   await Product.updateOne({_id:product._id},{$addToSet:{categoryIds:{$each:[...existingRoots,root._id]},subcategoryIds:{$each:[...existingChildren,child]}}});linked++;
  }
 }
 console.log(JSON.stringify({shapes,categories:roots.map(root=>root.name),linked}));
} finally {await mongoose.disconnect();}
