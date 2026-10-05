import 'dotenv/config';
import mongoose from 'mongoose';
import {copyFile} from 'node:fs/promises';
import Category from '../src/models/Category.js';
const catalog=[['Eyeglasses','eyeglasses',['Square','Rectangle','Round','Geometric','Cat Eye','Oval','Aviator','Clubmaster']],['Sunglasses','sunglasses',['Square','Rectangle','Round','Geometric','Oversized','Wayfarer','Cat Eye','Aviator','Clubmaster']],['Special Power','special_power',['Progressive','Bifocal','Trifocal','Reading Glasses','Computer Glasses']],['Contact Lenses','contact_lenses',['Daily','Weekly','Monthly','Colored','Prescription']],['Kids Glasses','kids_glasses',['Frames','Sunglasses','Accessories','Trending']],['Sale','sale',[]]];
try{
 await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
 for(const [index,[name,file,children]] of catalog.entries()){
  await copyFile(new URL(`../../frontend/src/assets/images/category/${file}.webp`,import.meta.url),new URL(`../public/products/category-${file}.webp`,import.meta.url));
  const image=`/assets/products/category-${file}.webp`;
  const root=await Category.findOneAndUpdate({name,parent:null},{$setOnInsert:{active:true},$set:{image,kind:'category',sortOrder:index}},{upsert:true,returnDocument:'after'});
  for(const [order,childName] of children.entries()){
   const shape=index<2;let childImage=image;
   if(shape){const filename=childName.toLowerCase().replaceAll(' ','');try{await copyFile(new URL(`../../frontend/src/assets/images/${file}/${filename}.webp`,import.meta.url),new URL(`../public/products/${file}-${filename}.webp`,import.meta.url));childImage=`/assets/products/${file}-${filename}.webp`;}catch(error){if(error.code!=='ENOENT')throw error;}}
   await Category.findOneAndUpdate({name:childName,parent:root._id},{$setOnInsert:{active:true},$set:{image:childImage,kind:shape?'shape':'type',sortOrder:order}},{upsert:true});
  }
 }
 await Category.updateMany({name:{$in:['Classic','Premium']},parent:{$ne:null}},{$set:{kind:'collection'}});
 console.log('Homepage categories, types, shapes and images saved.');
}finally{await mongoose.disconnect();}
