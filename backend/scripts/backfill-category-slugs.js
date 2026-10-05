import 'dotenv/config';
import mongoose from 'mongoose';
import Category,{categorySlug} from '../src/models/Category.js';
try {
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
 const rows=await Category.find().sort({_id:1});let updated=0;
 for(const row of rows){
  if(row.slug)continue;
  const base=categorySlug(row.name);let slug=base;let suffix=2;
  while(await Category.exists({slug,_id:{$ne:row._id}}))slug=`${base}-${suffix++}`;
  row.slug=slug;await row.save();updated++;
 }
 await Category.init();console.log(`Stored slugs for ${updated} categories and subcategories.`);
} finally {await mongoose.disconnect();}
