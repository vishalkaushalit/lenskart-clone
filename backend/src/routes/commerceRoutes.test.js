import test from 'node:test';
import assert from 'node:assert/strict';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import { discountAmount, quote, address, commerceAdmin } from './commerceRoutes.js';
import { requireAuth } from '../middleware/auth.js';
const productId='123456789012345678901234';
test('coupon amounts are rounded and cannot exceed the cart total',()=>{
  assert.equal(discountAmount({type:'percentage',value:25},1500),375);
  assert.equal(discountAmount({type:'fixed',value:2000},1500),1500);
  assert.equal(discountAmount({type:'percentage',value:33},100.01),33);
});
test('coupon schema rejects excessive percentages and invalid codes',async()=>{
  await new Coupon({code:'WELCOME',type:'percentage',value:10}).validate();
  for(const fields of [{value:101},{code:'bad code'},{minimum:-1}])await assert.rejects(new Coupon({code:'WELCOME',type:'percentage',value:10,...fields}).validate());
});
test('quote uses database prices and validates stock and selected options',async(t)=>{
  t.mock.method(Product,'findOne',async()=>({_id:productId,name:'Frame',price:1500,stock:2,color:'Black',size:'M',productType:'Eyeglasses',availableColors:['Blue'],availableSizes:['L']}));
  t.mock.method(Coupon,'findOne',async()=>({code:'SAVE',active:true,type:'fixed',value:500,minimum:1000}));
  const result=await quote([{id:productId,quantity:2,unitPrice:1,options:{color:'Blue',size:'L'}}],'SAVE');
  assert.equal(result.subtotal,3000);assert.equal(result.total,2500);assert.equal(result.items[0].unitPrice,1500);
  await assert.rejects(quote([{id:productId,quantity:3}]),/stock/);
  await assert.rejects(quote([{id:productId,quantity:1,options:{size:'XL'}}]),/selection/);
  await assert.rejects(quote([{id:productId,quantity:1},{id:productId,quantity:1}]),/quantities/);
});
test('expired and minimum-purchase coupons are rejected',async(t)=>{
  t.mock.method(Product,'findOne',async()=>({_id:productId,name:'Frame',price:500,stock:2,color:'Black',size:'M',productType:'Eyeglasses'}));
  const mock=t.mock.method(Coupon,'findOne',async()=>({code:'SAVE',type:'fixed',value:100,minimum:1000}));
  await assert.rejects(quote([{id:productId,quantity:1}],'SAVE'),/Minimum/);
  mock.mock.mockImplementation(async()=>({code:'SAVE',type:'fixed',value:100,minimum:0,expiresAt:new Date(0)}));
  await assert.rejects(quote([{id:productId,quantity:1}],'SAVE'),/expired/);
});
test('address validation rejects missing and malformed fields',()=>{
  const input={name:'Customer',phone:'9999999999',email:'customer@example.com',address:'Street 1',city:'Delhi',state:'Delhi',pincode:'110001'};
  assert.equal(address(input).city,'Delhi');
  assert.throws(()=>address({...input,pincode:'000000'}));assert.throws(()=>address({...input,email:'bad'}));assert.throws(()=>address({}));
});
test('admin commerce API requires authentication and an admin role',()=>{
  assert.equal(commerceAdmin.stack[0].handle,requireAuth);
  let status;const res={status(code){status=code;return this;},json(){}};
  commerceAdmin.stack[1].handle({user:{role:'customer'}},res,()=>assert.fail('customer passed'));
  assert.equal(status,403);
});

test('COD checkout retries return the existing order without decrementing stock twice',async(t)=>{
  const {default:mongoose}=await import('mongoose');
  const {default:Order}=await import('../models/Order.js');
  const {commercePublic}=await import('./commerceRoutes.js');
  let ended=false;
  const session={withTransaction:async callback=>callback(),endSession:async()=>{ended=true;}};
  t.mock.method(mongoose,'startSession',async()=>session);
  t.mock.method(Order,'findOne',()=>({session:async()=>({_id:productId,totalAmount:1500})}));
  t.mock.method(Product,'updateOne',()=>assert.fail('retry decremented stock'));
  const route=commercePublic.stack.find(layer=>layer.route?.path==='/orders').route;
  const handler=route.stack.at(-1).handle;
  const a={name:'Customer',phone:'9999999999',email:'customer@example.com',address:'Street 1',city:'Delhi',state:'Delhi',pincode:'110001'};
  let response;const res={status(code){assert.equal(code,201);return this;},json(body){response=body;}};
  await handler({user:{_id:productId},body:{paymentMethod:'cod',shipping:a,requestId:'order-request-123'}},res,assert.ifError);
  assert.equal(response.order.totalAmount,1500);assert.equal(ended,true);
});
test('online order placement is rejected before accessing the database',async()=>{
  const {commercePublic}=await import('./commerceRoutes.js');
  const handler=commercePublic.stack.find(layer=>layer.route?.path==='/orders').route.stack.at(-1).handle;
  let status;let message;const res={status(code){status=code;return this;},json(body){message=body.message;}};
  await handler({body:{paymentMethod:'online'}},res,assert.ifError);
  assert.equal(status,400);assert.match(message,/not connected/);
});
