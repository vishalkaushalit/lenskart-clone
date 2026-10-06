import test from 'node:test';
import Order from '../models/Order.js';
import User from '../models/User.js';
import assert from 'node:assert/strict';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import { discountAmount, quote, address, commerceAdmin, commercePublic } from './commerceRoutes.js';
import { requireAuth } from '../middleware/auth.js';

test('coupon search filters both the total and rows before pagination', async t => {
  let counted;
  t.mock.method(Coupon, 'countDocuments', async filter => { counted = filter; return 1; });
  t.mock.method(Coupon, 'find', filter => {
    assert.deepEqual(filter, counted);
    assert.equal(filter.$and[0].$or[0].code.$regex, 'SAVE');
    const chain = { sort(){return this;}, skip(value){assert.equal(value,20);return this;}, limit(){return this;}, lean:async()=>[{code:'SAVE'}] };
    return chain;
  });
  const handler=commerceAdmin.stack.find(layer=>layer.route?.path==='/coupons'&&layer.route.methods.get).route.stack[0].handle;
  await handler({query:{search:' SAVE ',page:'2'}},{json(result){assert.equal(result.total,1);assert.equal(result.coupons[0].code,'SAVE');}},assert.ifError);
});

test('order search supports customer details and a numeric order ID', async t => {
  t.mock.method(User, 'find', () => ({select(){return this;},lean:async()=>[{_id:'customer-id'}]}));
  let counted;
  t.mock.method(Order, 'countDocuments', async filter => {counted=filter;return 1;});
  t.mock.method(Order, 'find', filter => {
    assert.deepEqual(filter,counted);
    assert.equal(filter.status,'confirmed');
    assert.ok(filter.$and[0].$or.some(option=>option.user?.$in.includes('customer-id')));
    assert.ok(filter.$and[1].$or.some(option=>option.orderId===123));
    return {populate(){return this;},sort(){return this;},skip(){return this;},limit(){return this;},lean:async()=>[{orderId:123}]};
  });
  const handler=commerceAdmin.stack.find(layer=>layer.route?.path==='/orders'&&layer.route.methods.get).route.stack[0].handle;
  await handler({query:{search:'John #123',status:'confirmed'}},{json(result){assert.equal(result.total,1);assert.equal(result.orders[0].orderId,123);}},assert.ifError);
});
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
test('percentage coupon response includes its actual rate and calculated savings',async(t)=>{
  t.mock.method(Product,'findOne',async()=>({_id:productId,name:'Frame',price:1500,stock:2,color:'Black',size:'M',productType:'Eyeglasses'}));
  t.mock.method(Coupon,'findOne',async()=>({code:'SAVE10',type:'percentage',value:10,minimum:0}));
  const result=await quote([{id:productId,quantity:1}],'SAVE10');
  assert.equal(result.percentage,10);
  assert.equal(result.discount,150);
  assert.equal(result.total,1350);
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

test('direct coupon details supports page refresh and missing-record errors',async t=>{
 const id='123456789012345678901234';const mock=t.mock.method(Coupon,'findById',value=>{assert.equal(value,id);return {lean:async()=>({_id:id,code:'SAVE10',value:10})};});
 const handler=commerceAdmin.stack.find(layer=>layer.route?.path==='/coupons/:id'&&layer.route.methods.get).route.stack.at(-1).handle;
 await handler({params:{id}},{json(data){assert.equal(data.coupon.code,'SAVE10');}},assert.ifError);
 mock.mock.mockImplementation(()=>({lean:async()=>null}));await handler({params:{id}},{status(code){assert.equal(code,404);return this;},json(data){assert.equal(data.message,'Coupon not found.');}},assert.ifError);
});

test('customer receipt lookup is scoped to the signed-in user', async t => {
  const orderId='507f1f77bcf86cd799439011';
  t.mock.method(Order,'findOne',filter=>{
    assert.deepEqual(filter,{_id:orderId,user:'customer-id'});
    return {lean:async()=>({ _id:orderId })};
  });
  const route=commercePublic.stack.find(layer=>layer.route?.path==='/orders/:id'&&layer.route.methods.get).route;
  assert.equal(route.stack[0].handle,requireAuth);
  await route.stack[1].handle({params:{id:orderId},user:{_id:'customer-id'}},{json(data){assert.equal(data.order._id,orderId);}},assert.ifError);
});

test('missing or other-customer receipts return 404', async t => {
  t.mock.method(Order,'findOne',()=>({lean:async()=>null}));
  const handler=commercePublic.stack.find(layer=>layer.route?.path==='/orders/:id'&&layer.route.methods.get).route.stack[1].handle;
  await handler({params:{id:'507f1f77bcf86cd799439011'},user:{_id:'customer-id'}},{status(code){assert.equal(code,404);return this;},json(data){assert.equal(data.message,'Order not found.');}},assert.ifError);
});
