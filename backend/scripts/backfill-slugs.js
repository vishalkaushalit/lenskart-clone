import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import {availableSlug} from '../src/utils/slugs.js';
try {
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000,autoIndex:false});
 for(const Model of [Category,Product]){
  const rows=await Model.find().sort({_id:1});const seen=new Set();let changed=0;
  for(const row of rows){
   if(!row.slug||seen.has(row.slug)){row.slug=await availableSlug(Model,row.name,row._id);await row.save();changed++;}
   seen.add(row.slug);
  }
  await Model.createIndexes();
  console.log(`${Model.modelName}: ${rows.length} unique stored slugs, ${changed} updated.`);
 }
 const indexes=await Category.collection.indexes();
 for(const index of indexes)if(index.key.parent===1&&index.key.slug===1)await Category.collection.dropIndex(index.name);
} finally {await mongoose.disconnect();}
