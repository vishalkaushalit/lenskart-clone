import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../src/models/Order.js';
import {initializeOrderIds} from '../src/services/orderIds.js';
try{await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});console.log(JSON.stringify(await initializeOrderIds(Order.collection)));}finally{await mongoose.disconnect();}
