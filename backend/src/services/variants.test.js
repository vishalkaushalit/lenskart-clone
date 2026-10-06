import test from 'node:test';
import assert from 'node:assert/strict';
import ProductVariant from '../models/ProductVariant.js';
import Product from '../models/Product.js';
import { attachVariants } from './variants.js';
import { quote } from '../routes/commerceRoutes.js';
const productId='123456789012345678901234';
const variantId='123456789012345678901235';
test('variant fields validate and size/color uniqueness is scoped to its parent', async()=>{
  const valid={productId,size:'XL',color:'Blue',stock:3,images:['/assets/products/frame.jpg']};
  await new ProductVariant(valid).validate();
  for(const fields of [{size:'XXL'},{color:''},{stock:1.5},{stock:-1},{price:-1},{originalPrice:-1},{price:1500,originalPrice:1000},{images:['javascript:alert(1)']},{images:Array(9).fill('/assets/products/frame.jpg')}])await assert.rejects(new ProductVariant({...valid,...fields}).validate());
  const index=ProductVariant.schema.indexes().find(([,options])=>options.unique);
  assert.deepEqual(index[0],{productId:1,size:1,color:1});assert.equal(index[1].collation.strength,2);
});
test('public variants exclude inactive rows and stock is derived from active variants',async t=>{
  t.mock.method(ProductVariant,'find',filter=>{assert.equal(filter.status,'active');return {sort(){return this;},lean:async()=>[{_id:variantId,productId,size:'M',color:'Blue',stock:2,status:'active',images:[]}]};});
  const [result]=await attachVariants([{_id:productId,hasVariants:true,stock:999}]);
  assert.equal(result.stock,2);assert.equal(result.variants[0].productId,productId);
  assert.deepEqual(result.availableColors,['Blue']);assert.deepEqual(result.availableSizes,['M']);
});
test('admin sees inactive variants but their stock is excluded',async t=>{
  t.mock.method(ProductVariant,'find',filter=>{assert.equal(filter.status,undefined);return {sort(){return this;},lean:async()=>[{_id:variantId,productId,size:'M',color:'Blue',stock:2,status:'active',images:[]},{_id:'other',productId,size:'L',color:'Blue',stock:100,status:'inactive',images:[]}]};});
  const [result]=await attachVariants([{_id:productId,hasVariants:true,availableColors:['Red'],availableSizes:['XL']}],true);assert.equal(result.stock,2);assert.equal(result.variants.length,2);
  assert.deepEqual(result.availableColors,['Blue']);assert.deepEqual(result.availableSizes,['M']);
});
test('batch variant attachment preserves product isolation, order and empty inventories',async t=>{
  const secondId='123456789012345678901236';
  const emptyId='123456789012345678901237';
  const legacy={_id:'legacy',hasVariants:false,stock:7};
  let calls=0;
  t.mock.method(ProductVariant,'find',filter=>{
    calls++;
    assert.deepEqual(filter.productId.$in,[productId,secondId,emptyId]);
    return {sort(){return this;},lean:async()=>[
      {_id:'first',productId,size:'M',color:'Blue',stock:2,status:'active'},
      {_id:'other',productId:secondId,size:'L',color:'Red',stock:4,status:'active'},
      {_id:'second',productId,size:'L',color:'Blue',stock:3,status:'active'},
      {_id:'hidden',productId:secondId,size:'S',color:'Black',stock:99,status:'inactive'},
    ]};
  });
  const results=await attachVariants([{_id:productId,hasVariants:true},{_id:secondId,hasVariants:true},{_id:emptyId,hasVariants:true,stock:999},legacy],true);
  assert.equal(calls,1);
  assert.deepEqual(results[0].variants.map(row=>row.id),['first','second']);
  assert.deepEqual(results[0].availableColors,['Blue']);
  assert.deepEqual(results[0].availableSizes,['M','L']);
  assert.equal(results[0].stock,5);assert.equal(results[1].stock,4);
  assert.deepEqual(results[1].availableColors,['Red']);
  assert.equal(results[2].stock,0);assert.deepEqual(results[2].variants,[]);
  assert.strictEqual(results[3],legacy);
});
test('quote prices variants from the database and enforces their stock and combination',async t=>{
  t.mock.method(Product,'findOne',async()=>({_id:productId,hasVariants:true,name:'Frame',price:1500,stock:999}));
  let row={_id:variantId,productId,size:'L',color:'Blue',price:1800,stock:2};
  t.mock.method(ProductVariant,'findOne',filter=>{assert.equal(filter.productId,productId);assert.equal(filter.status,'active');return {collation(){return Promise.resolve(row);}};});
  const items=[{id:productId,quantity:2,unitPrice:1,options:{color:'Blue',size:'L'}}];
  assert.equal((await quote(items)).subtotal,3600);assert.equal((await quote(items)).items[0].variant,variantId);
  row.price=null;assert.equal((await quote(items)).subtotal,3000);
  await assert.rejects(quote([{...items[0],quantity:3}]),/stock/);
  await assert.rejects(quote([items[0],items[0]]),/quantities/);
  await assert.rejects(quote([{...items[0],options:{color:{$ne:''},size:'L'}}]),/selection/);
  row=null;await assert.rejects(quote(items),/variant is unavailable/);
});
test('two variants of a product are distinct checkout lines',async t=>{
  t.mock.method(Product,'findOne',async()=>({_id:productId,hasVariants:true,name:'Frame',price:1000}));
  t.mock.method(ProductVariant,'findOne',filter=>({collation(){return Promise.resolve({_id:filter.size,productId,size:filter.size,color:'Blue',price:null,stock:2});}}));
  const result=await quote(['M','L'].map(size=>({id:productId,quantity:1,options:{size,color:'Blue'}})));
  assert.equal(result.items.length,2);assert.equal(result.subtotal,2000);
});

test('placing a variant order reserves only variant inventory and stores its identity',async t=>{
 const {default:mongoose}=await import('mongoose');const {default:Order}=await import('../models/Order.js');const {commercePublic}=await import('../routes/commerceRoutes.js');
 const session={withTransaction:async callback=>callback(),endSession:async()=>{}};t.mock.method(mongoose,'startSession',async()=>session);
 t.mock.method(Order,'findOne',()=>({session:async()=>null}));
 t.mock.method(Product,'findOne',()=>({session:async()=>({_id:productId,hasVariants:true,name:'Frame',price:1000})}));
 t.mock.method(ProductVariant,'findOne',()=>({collation(){return this;},session:async()=>({_id:variantId,productId,size:'M',color:'Blue',stock:2,price:1200})}));
 t.mock.method(ProductVariant,'updateOne',async(filter,update,options)=>{assert.deepEqual(filter,{_id:variantId,productId,status:'active',stock:{$gte:1}});assert.deepEqual(update,{$inc:{stock:-1}});assert.equal(options.session,session);return {modifiedCount:1};});
 t.mock.method(Product,'updateOne',async(filter,update)=>{assert.deepEqual(update,{$inc:{sales:1}});return {modifiedCount:1};});
 t.mock.method(Order,'create',async([order],options)=>{assert.equal(order.items[0].variant,variantId);assert.equal(order.totalAmount,1200);assert.equal(options.session,session);return [order];});
 const handler=commercePublic.stack.find(layer=>layer.route?.path==='/orders').route.stack.at(-1).handle;
 const shipping={name:'Customer',phone:'9999999999',email:'customer@example.com',address:'Street 1',city:'Delhi',state:'Delhi',pincode:'110001'};
 await handler({user:{_id:productId},body:{requestId:'variant-request-123',paymentMethod:'cod',shipping,items:[{id:productId,variantId,quantity:1,options:{color:'Blue',size:'M'}}]}},{status(code){assert.equal(code,201);return this;},json(){}},assert.ifError);
});
test('cancellation restores the ordered variant once, including inactive variants',async t=>{
 const {default:mongoose}=await import('mongoose');const {default:Order}=await import('../models/Order.js');const {commerceAdmin}=await import('../routes/commerceRoutes.js');
 const session={withTransaction:async callback=>callback(),endSession:async()=>{}};t.mock.method(mongoose,'startSession',async()=>session);
 const order={status:'confirmed',items:[{product:productId,variant:variantId,quantity:2}],save:async()=>{}};
 t.mock.method(Order,'findById',()=>({session:async()=>order}));let restores=0;
 t.mock.method(ProductVariant,'updateOne',async(filter,update)=>{assert.deepEqual(filter,{_id:variantId,productId});assert.deepEqual(update,{$inc:{stock:2}});restores++;});
 t.mock.method(Product,'updateOne',async(filter,update)=>assert.deepEqual(update,{$inc:{sales:-2}}));
 const handler=commerceAdmin.stack.find(layer=>layer.route?.path==='/orders/:id'&&layer.route.methods.patch).route.stack.at(-1).handle;
 const req={params:{id:productId},body:{status:'cancelled'}};await handler(req,{json(){}},assert.ifError);await handler(req,{json(){}},assert.ifError);assert.equal(restores,1);
});
