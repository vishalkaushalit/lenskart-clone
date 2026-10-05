import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';
try {
  await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});
  for (const [key,value] of Object.entries({faqs:[],reviews:[],highlightImages:{material:'',hinge:'',temple:'',nosepad:''}})) await Product.updateMany({[key]:{$exists:false}},{$set:{[key]:value}});
  const sample = await Product.findOneAndUpdate({sku:'frame-1'},{$set:{
    lensTypes:['Powered Eyeglass','Zero Power','Reading Glasses','Sunglass'],
    availableColors:['Black','Blue','Grey'],availableSizes:['S','M','L','XL'],
    faqs:[{question:'How do I choose the right size?',answer:'Compare the size with your existing glasses. You can select a listed frame size above.'},{question:'Can I save this product for later?',answer:'Use the heart icon to add this frame to your wishlist.'},{question:'Where can I check delivery and service terms?',answer:'Contact the store to confirm delivery availability, return eligibility, exchange terms, and warranty coverage before ordering.'}],
    highlightImages:{material:'/assets/products/square.webp',hinge:'/assets/products/square.webp',temple:'/assets/products/square.webp',nosepad:'/assets/products/square.webp'}
  }},{new:true,runValidators:true});
  console.log(JSON.stringify({sample:sample?.name,colors:sample?.availableColors,sizes:sample?.availableSizes}));
} finally {await mongoose.disconnect();}
