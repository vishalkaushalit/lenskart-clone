import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import CustomerReview from '../models/CustomerReview.js';
import { deleteCategory, deleteCoupon, deleteCancelledOrder } from './deletionController.js';
import { commerceAdmin } from '../routes/commerceRoutes.js';
import { adminCategories } from '../routes/categoryRoutes.js';
import { requireAuth } from '../middleware/auth.js';
const id='123456789012345678901234';
const req={params:{id}};
const response=()=>({statusCode:200,status(value){this.statusCode=value;return this;},json(body){this.body=body;return this;}});

test('category deletion protects subcategories and assigned products',async t=>{
 let children=true;let assigned=false;
 t.mock.method(Category,'exists',async()=>children);
 t.mock.method(Product,'exists',async filter=>{assert.equal(filter.$or.length,4);return assigned;});
 const remove=t.mock.method(Category,'findByIdAndDelete',async value=>{assert.equal(value,id);return {_id:id};});
 let res=response();await deleteCategory(req,res,assert.ifError);assert.equal(res.statusCode,409);
 children=false;assigned=true;res=response();await deleteCategory(req,res,assert.ifError);assert.equal(res.statusCode,409);
 assert.equal(remove.mock.callCount(),0);
 assigned=false;res=response();await deleteCategory(req,res,assert.ifError);assert.equal(res.body.success,true);
});
test('coupon deletion returns success or missing record without modifying orders',async t=>{
 let found=true;
 t.mock.method(Coupon,'findByIdAndDelete',async value=>{assert.equal(value,id);return found?{_id:id}:null;});
 let res=response();await deleteCoupon(req,res,assert.ifError);assert.equal(res.body.success,true);
 found=false;res=response();await deleteCoupon(req,res,assert.ifError);assert.equal(res.statusCode,404);
});
test('order deletion atomically targets only cancelled orders and does not alter inventory',async t=>{
 const session={withTransaction:async callback=>callback(),endSession:async()=>{}};
 t.mock.method(mongoose,'startSession',async()=>session);
 t.mock.method(CustomerReview,'exists',filter=>{assert.deepEqual(filter,{order:id});return {session:async()=>null};});
 let found=true;
 t.mock.method(Order,'findOneAndDelete',async(filter,options)=>{assert.deepEqual(filter,{_id:id,status:'cancelled'});assert.equal(options.session,session);return found?{_id:id}:null;});
 t.mock.method(Product,'updateOne',()=>assert.fail('inventory must not be changed twice'));
 let res=response();await deleteCancelledOrder(req,res,assert.ifError);assert.equal(res.body.success,true);
 found=false;res=response();await deleteCancelledOrder(req,res,assert.ifError);assert.equal(res.statusCode,409);
});
test('orders with customer reviews cannot be deleted',async t=>{
 t.mock.method(mongoose,'startSession',async()=>({withTransaction:async callback=>callback(),endSession:async()=>{}}));
 t.mock.method(CustomerReview,'exists',()=>({session:async()=>true}));
 t.mock.method(Order,'findOneAndDelete',()=>assert.fail('referenced order deleted'));
 const res=response();await deleteCancelledOrder(req,res,assert.ifError);assert.equal(res.statusCode,409);
});
test('invalid delete identifiers are rejected before database work',async()=>{
 for(const handler of [deleteCategory,deleteCoupon,deleteCancelledOrder]){const res=response();await handler({params:{id:'invalid'}},res,assert.ifError);assert.equal(res.statusCode,400);}
});
test('new delete routes remain restricted to admins',()=>{
 for(const router of [commerceAdmin,adminCategories]){
  assert.equal(router.stack[0].handle,requireAuth);
  const res=response();router.stack[1].handle({user:{role:'customer'}},res,()=>assert.fail('customer allowed'));assert.equal(res.statusCode,403);
 }
 assert.ok(commerceAdmin.stack.some(layer=>layer.route?.path==='/orders/:id'&&layer.route.methods.delete));
 assert.ok(commerceAdmin.stack.some(layer=>layer.route?.path==='/coupons/:id'&&layer.route.methods.delete));
 assert.ok(adminCategories.stack.some(layer=>layer.route?.path==='/:id'&&layer.route.methods.delete));
});
