import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import router from './variantRoutes.js';
const productId='123456789012345678901234',variantId='123456789012345678901235';
const handler=method=>router.stack.find(layer=>layer.route?.methods[method]).route.stack[0].handle;
function transaction(t){const session={withTransaction:async callback=>callback(),endSession:async()=>{}};t.mock.method(mongoose,'startSession',async()=>session);return session;}
test('adding a variant links the requested product and enables variant inventory atomically',async t=>{
 const session=transaction(t);const product={_id:productId,save:async options=>assert.equal(options.session,session)};
 t.mock.method(Product,'findById',id=>{assert.equal(id,productId);return {session:async()=>product};});
 t.mock.method(ProductVariant,'create',async([fields],options)=>{assert.equal(options.session,session);assert.equal(fields.productId,productId);assert.equal(fields.privateField,undefined);return [{_id:variantId,...fields}];});
 const response={status(code){assert.equal(code,201);return this;},json(data){assert.equal(data.variant.productId,productId);}};
 await handler('post')({params:{id:productId},body:{productId:'malicious',privateField:true,size:'M',color:'Blue',stock:2,images:[]}},response,assert.ifError);
 assert.equal(product.hasVariants,true);
});
test('editing is scoped to both variant and parent and rejects cross-product IDs',async t=>{
 transaction(t);t.mock.method(Product,'findById',()=>({session:async()=>({_id:productId})}));
 t.mock.method(ProductVariant,'findOne',filter=>{assert.deepEqual(filter,{_id:variantId,productId});return {session:async()=>null};});
 await handler('patch')({params:{id:productId,variantId},body:{}},{status(code){assert.equal(code,404);return this;},json(data){assert.equal(data.message,'Variant not found.');}},assert.ifError);
});
test('duplicate size/color combinations report a conflict',async t=>{
 transaction(t);t.mock.method(Product,'findById',()=>({session:async()=>({_id:productId})}));t.mock.method(ProductVariant,'create',async()=>{throw Object.assign(new Error('duplicate'),{code:11000});});
 await handler('post')({params:{id:productId},body:{size:'M',color:'Blue'}},{status(code){assert.equal(code,409);return this;},json(data){assert.match(data.message,/combination already exists/);}},assert.ifError);
});

test('deleting an unused variant scopes the mutation to its parent and keeps variant inventory enabled',async t=>{
 const {default:Order}=await import('../models/Order.js');const session=transaction(t);const product={_id:productId,hasVariants:true,save:async options=>assert.equal(options.session,session)};
 t.mock.method(Product,'findById',()=>({session:async()=>product}));
 t.mock.method(ProductVariant,'findOne',filter=>{assert.deepEqual(filter,{_id:variantId,productId});return {session:async()=>({_id:variantId})};});
 t.mock.method(Order,'exists',filter=>{assert.deepEqual(filter,{'items.variant':variantId});return {session:async()=>null};});
 t.mock.method(ProductVariant,'deleteOne',async(filter,options)=>{assert.deepEqual(filter,{_id:variantId,productId});assert.equal(options.session,session);});
 await handler('delete')({params:{id:productId,variantId}},{json(data){assert.equal(data.message,'Variant deleted.');}},assert.ifError);assert.equal(product.hasVariants,true);
});
test('ordered variants cannot be deleted and retain inventory for cancellations',async t=>{
 const {default:Order}=await import('../models/Order.js');transaction(t);
 t.mock.method(Product,'findById',()=>({session:async()=>({_id:productId})}));t.mock.method(ProductVariant,'findOne',()=>({session:async()=>({_id:variantId})}));
 t.mock.method(Order,'exists',()=>({session:async()=>({_id:'order'})}));t.mock.method(ProductVariant,'deleteOne',()=>assert.fail('Ordered variant was deleted'));
 await handler('delete')({params:{id:productId,variantId}},{status(code){assert.equal(code,409);return this;},json(data){assert.match(data.message,/Inactive/);}},assert.ifError);
});
test('variant deletion rejects invalid IDs and cross-product variants',async t=>{
 await handler('delete')({params:{id:productId,variantId:'invalid'}},{status(code){assert.equal(code,400);return this;},json(){}},assert.ifError);
 transaction(t);t.mock.method(Product,'findById',()=>({session:async()=>({_id:productId})}));t.mock.method(ProductVariant,'findOne',()=>({session:async()=>null}));
 await handler('delete')({params:{id:productId,variantId}},{status(code){assert.equal(code,404);return this;},json(){}},assert.ifError);
});
