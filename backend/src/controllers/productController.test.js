import test from 'node:test';
import assert from 'node:assert/strict';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import CustomerReview from '../models/CustomerReview.js';
import { listProducts, deleteProduct, saveProduct, productFields, publicProduct, productDetails, storefrontProductDetails } from './productController.js';
import { managedProducts } from '../routes/productRoutes.js';
import { requireAuth } from '../middleware/auth.js';
const response = () => ({ statusCode:200, status(code) { this.statusCode=code; return this; }, json(body) { this.body=body; return this; } });
test('storefront only queries active eyeglasses and exposes product fields', async (t) => {
  t.mock.method(Product, 'find', (filter) => {
    assert.deepEqual(filter, { status:'active', productType:'Eyeglasses' });
    return { sort() { return this; }, async lean() { return [{ _id:'id', name:'Frame', price:1500, private:'hidden' }]; } };
  });
  const res=response(); await listProducts({},res,assert.ifError);
  assert.equal(res.body.products[0].name,'Frame');
  assert.equal(res.body.products[0].private,undefined);
});
test('product mutation ignores protected and unknown fields', () => {
  assert.deepEqual(productFields({ name:'Frame', price:1500, sales:999, _id:'other', $set:{status:'active'} }), { name:'Frame', price:1500 });
});
test('invalid IDs do not reach database writes', async (t) => {
  t.mock.method(Product,'findByIdAndUpdate',()=>assert.fail('unexpected write'));
  const res=response(); await saveProduct({params:{id:'invalid'},body:{name:'Test'}},res,assert.ifError);
  assert.equal(res.statusCode,400);
});
test('admin product routes require a session and admin role', async () => {
  assert.equal(managedProducts.stack[0].handle,requireAuth);
  const guest=response(); await managedProducts.stack[0].handle({session:{}},guest,()=>assert.fail('guest passed'));
  assert.equal(guest.statusCode,401);
  const customer=response(); managedProducts.stack[1].handle({user:{role:'customer'}},customer,()=>assert.fail('customer passed'));
  assert.equal(customer.statusCode,403);
});
test('product schema rejects invalid price, stock, category and image schemes', async () => {
  const base={sku:'test',name:'Test',image:'/assets/products/square.webp',shape:'Square',brand:'Lenskart',price:1500,originalPrice:2000,color:'Black'};
  await new Product(base).validate();
  for (const fields of [{price:-1},{stock:1.5},{category:'unknown'},{image:'javascript:alert(1)'}]) await assert.rejects(new Product({...base,...fields}).validate());
});


test('product details returns the gallery, description, and features', async (t) => {
  t.mock.method(CustomerReview, 'find', () => ({select(){return this;},sort(){return this;},lean:async()=>[]}));
  const id = '123456789012345678901234';
  t.mock.method(Product, 'findById', (actual) => {
    assert.equal(actual, id);
    return { async lean() { return { _id: id, image: '/assets/products/a.png', images: ['/assets/products/a.png', '/assets/products/b.png'], description: 'Light frames', features: ['Comfortable fit'] }; } };
  });
  const res = response();
  await productDetails({ params: { id } }, res, assert.ifError);
  assert.equal(res.body.product.description, 'Light frames');
  assert.equal(res.body.product.images.length, 2);
  assert.deepEqual(res.body.product.features, ['Comfortable fit']);
});

test('details handles missing products and invalid IDs', async (t) => {
  t.mock.method(Product, 'findById', () => ({ async lean() { return null; } }));
  for (const [id, status] of [['invalid!', 400], ['123456789012345678901234', 404]]) {
    const res = response();
    await productDetails({ params: { id } }, res, assert.ifError);
    assert.equal(res.statusCode, status);
  }
});


test('storefront details only returns active products', async (t) => {
  const id = '123456789012345678901234';
  t.mock.method(Product, 'findOne', (filter) => {
    assert.deepEqual(filter, { _id:id, status:'active' });
    return { async lean() { return null; } };
  });
  const res=response();
  await storefrontProductDetails({params:{id}},res,assert.ifError);
  assert.equal(res.statusCode,404);
});

test('storefront detail fields are editable and reject invalid sizes and oversized highlights', async () => {
  const fields = { subtitle:'Black square frame', lensTypes:['Powered Eyeglasses'], availableColors:['Black'], availableSizes:['S','M'], offerTitle:'Offer', offerText:'Use code FRAME', deliveryInformation:'Dispatch in two days', assurances:['One year warranty'], material:'Acetate', hinge:'Metal hinge', temple:'Flexible arms', nosepad:'Built in nose pads' };
  const {availableColors,availableSizes,...editableFields}=fields;
  assert.deepEqual(productFields(fields), editableFields);
  const legacy=publicProduct({_id:'legacy',availableColors,availableSizes});
  assert.deepEqual(legacy.availableColors,availableColors);assert.deepEqual(legacy.availableSizes,availableSizes);
  const base = { sku:'detail-test',name:'Frame',image:'/assets/products/square.webp',shape:'Square',brand:'Brand',price:1500,originalPrice:2000,color:'Black',...fields };
  await new Product(base).validate();
  await assert.rejects(new Product({...base, availableSizes:['invalid']}).validate());
  await assert.rejects(new Product({...base, nosepad:'x'.repeat(301)}).validate());
});

test('reviews, FAQ and highlight images validate before saving', async () => {
  const base={sku:'content-test',name:'Frame',image:'/assets/products/square.webp',shape:'Square',brand:'Brand',price:1500,originalPrice:2000,color:'Black'};
  const content={faqs:[{question:'Which size?',answer:'Medium.'}],reviews:[{name:'Customer',rating:5,text:'Comfortable',date:'2026-10-05'}],highlightImages:{material:'/assets/products/square.webp'},availableSizes:['M/L','XL']};
  await new Product({...base,...content}).validate();
  const {availableSizes,...editableContent}=content;
  assert.deepEqual(productFields(content),editableContent);
  assert.deepEqual(publicProduct({_id:'legacy',availableSizes}).availableSizes,availableSizes);
  for (const fields of [{reviews:[{name:'Customer',rating:6,text:'Review',date:'2026-10-05'}]},{faqs:[{question:'Question'}]},{highlightImages:{material:'javascript:alert(1)'}}]) await assert.rejects(new Product({...base,...fields}).validate());
});

test('multi-category membership preserves legacy category fallback',async()=>{
 const {publicProduct}=await import('./productController.js');const ids=['123456789012345678901234','123456789012345678901235'];
 assert.deepEqual(publicProduct({_id:'frame',categoryIds:ids}).categoryIds,ids);
 assert.deepEqual(publicProduct({_id:'legacy',categoryId:ids[0]}).categoryIds,[ids[0]]);
});
test('subcategory membership requires its parent to be selected',async(t)=>{
 const {default:Category}=await import('../models/Category.js');const root='123456789012345678901234',child='123456789012345678901235';
 t.mock.method(Category,'find',()=>({async lean(){return [{_id:root,parent:null},{_id:child,parent:'123456789012345678901236'}];}}));
 t.mock.method(Product,'create',()=>assert.fail('invalid assignment reached write'));
 const res=response();await saveProduct({params:{},body:{categoryIds:[root],subcategoryIds:[child]}},res,assert.ifError);assert.equal(res.statusCode,400);
});
test('batch product lookup validates IDs and includes active products of all types',async(t)=>{const id='123456789012345678901234';t.mock.method(Product,'find',filter=>{assert.deepEqual(filter,{status:'active',_id:{$in:[id]}});return {sort(){return this;},lean:async()=>[{_id:id}]};});const res=response();await listProducts({query:{ids:id}},res,assert.ifError);assert.equal(res.body.products[0].id,id);const invalid=response();await listProducts({query:{ids:'bad'}},invalid,assert.ifError);assert.equal(invalid.statusCode,400);});

 test('admin product details includes approved customer reviews separately from editable product reviews', async t => {
  const id = '123456789012345678901234';
  const legacy = [{ name: 'Guest', rating: 4, text: 'Existing review', date: new Date('2026-01-01') }];
  t.mock.method(Product, 'findById', () => ({ lean: async () => ({ _id: id, reviews: legacy }) }));
  t.mock.method(CustomerReview, 'find', filter => {
    assert.deepEqual(filter, { product: id, status: 'approved' });
    return { select(){return this;},sort(){return this;},lean:async()=>[{ name: 'Buyer', rating: 5, text: 'Approved review', createdAt: new Date('2026-02-01') }] };
  });
  const res = response(); await productDetails({ params: { id } }, res, assert.ifError);
  assert.deepEqual(res.body.product.reviews, legacy);
  assert.equal(res.body.product.customerReviews[0].verifiedPurchase, true);
  assert.equal(res.body.product.customerReviews[0].name, 'Buyer');
  assert.deepEqual(productFields({ customerReviews: res.body.product.customerReviews }), {});
});
test('admin product details resolves product slugs while preserving database identity', async t => {
  t.mock.method(Product, 'findOne', filter => { assert.deepEqual(filter, { slug: 'test-frame' }); return { lean: async () => ({ _id: '123456789012345678901234', slug: 'test-frame' }) }; });
  t.mock.method(CustomerReview, 'find', () => ({ select(){return this;},sort(){return this;},lean:async()=>[] }));
  const res = response(); await productDetails({ params: { id: 'test-frame' } }, res, assert.ifError);
  assert.equal(res.body.product.id, '123456789012345678901234');
  assert.equal(res.body.product.slug, 'test-frame');
});

test('products referenced by orders cannot be deleted, preserving receipts and cancellation inventory', async t => {
  t.mock.method(Order, 'exists', async filter => { assert.deepEqual(filter, { 'items.product': '123456789012345678901234' }); return true; });
  t.mock.method(Product, 'findByIdAndDelete', () => assert.fail('ordered product deleted'));
  const res = response(); await deleteProduct({ params: { id: '123456789012345678901234' } }, res, assert.ifError);
  assert.equal(res.statusCode, 409); assert.match(res.body.message, /Inactive/);
});
test('unreferenced products can be deleted and missing products return not found', async t => {
  t.mock.method(Order, 'exists', async () => false);
  let found = true;
  t.mock.method(Product, 'findByIdAndDelete', async () => found ? { _id: '123456789012345678901234' } : null);
  let res = response(); await deleteProduct({ params: { id: '123456789012345678901234' } }, res, assert.ifError); assert.equal(res.body.success, true);
  found = false; res = response(); await deleteProduct({ params: { id: '123456789012345678901234' } }, res, assert.ifError); assert.equal(res.statusCode, 404);
});
test('product detail reads start variants and approved reviews concurrently', { timeout: 1000 }, async t => {
  const { default: ProductVariant } = await import('../models/ProductVariant.js');
  const id = '123456789012345678901234';
  const product = { _id: id, slug: 'frame', hasVariants: true, reviews: [] };
  let finishVariants;
  t.mock.method(Product, 'findById', () => ({ lean: async () => ({ ...product }) }));
  t.mock.method(Product, 'findOne', () => ({ lean: async () => ({ ...product }) }));
  t.mock.method(ProductVariant, 'find', () => ({ sort(){return this;},lean:()=>new Promise(resolve=>{finishVariants=resolve;}) }));
  t.mock.method(CustomerReview, 'find', () => {
    assert.equal(typeof finishVariants, 'function');
    finishVariants([]);
    return { select(){return this;},sort(){return this;},lean:async()=>[] };
  });
  for (const handler of [productDetails, storefrontProductDetails]) {
    finishVariants = undefined;
    const res = response(); await handler({ params: { id } }, res, assert.ifError);
    assert.equal(res.body.product.id, id);
  }
});

test('product SEO fields are editable, public and validated', async () => {
  const fields = { seoTitle: 'Custom frame title', seoDescription: 'Custom search description', seoImage: 'https://example.com/frame.jpg' };
  assert.deepEqual(productFields(fields), fields);
  const result = publicProduct({ _id: '507f1f77bcf86cd799439011', ...fields });
  for (const key of Object.keys(fields)) assert.equal(result[key], fields[key]);
  const invalid = new Product({ seoTitle: 'x'.repeat(121), seoDescription: 'x'.repeat(321), seoImage: 'javascript:alert(1)' });
  const error = invalid.validateSync();
  for (const key of Object.keys(fields)) assert.ok(error.errors[key]);
});
