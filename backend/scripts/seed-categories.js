import 'dotenv/config';
import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
try{
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});await Category.init();
 for(const name of ['Eyeglasses','Sunglasses']){
  const parent=await Category.findOneAndUpdate({name,parent:null},{$setOnInsert:{name,parent:null,active:true}},{upsert:true,returnDocument:'after'});
  for(const collection of ['Classic','Premium']){const child=await Category.findOneAndUpdate({name:collection,parent:parent._id},{$setOnInsert:{name:collection,parent:parent._id,active:true}},{upsert:true,returnDocument:'after'});await Product.updateMany({productType:name,category:collection,$or:[{categoryId:null},{categoryId:{$exists:false}}]},{$set:{categoryId:parent._id,subcategoryId:child._id}});}
 }
 console.log('Categories seeded and existing products linked.');
}finally{await mongoose.disconnect();}
