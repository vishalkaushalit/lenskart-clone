import test from 'node:test';
import assert from 'node:assert/strict';
import Product from '../models/Product.js';
import { listProducts, saveProduct, productFields, productDetails, storefrontProductDetails } from './productController.js';
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
  for (const [id, status] of [['invalid', 400], ['123456789012345678901234', 404]]) {
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
  assert.deepEqual(productFields(fields), fields);
  const base = { sku:'detail-test',name:'Frame',image:'/assets/products/square.webp',shape:'Square',brand:'Brand',price:1500,originalPrice:2000,color:'Black',...fields };
  await new Product(base).validate();
  await assert.rejects(new Product({...base, availableSizes:['invalid']}).validate());
  await assert.rejects(new Product({...base, nosepad:'x'.repeat(301)}).validate());
});

test('reviews, FAQ and highlight images validate before saving', async () => {
  const base={sku:'content-test',name:'Frame',image:'/assets/products/square.webp',shape:'Square',brand:'Brand',price:1500,originalPrice:2000,color:'Black'};
  const content={faqs:[{question:'Which size?',answer:'Medium.'}],reviews:[{name:'Customer',rating:5,text:'Comfortable',date:'2026-10-05'}],highlightImages:{material:'/assets/products/square.webp'},availableSizes:['M/L','XL']};
  await new Product({...base,...content}).validate();
  assert.deepEqual(productFields(content),content);
  for (const fields of [{reviews:[{name:'Customer',rating:6,text:'Review',date:'2026-10-05'}]},{faqs:[{question:'Question'}]},{highlightImages:{material:'javascript:alert(1)'}}]) await assert.rejects(new Product({...base,...fields}).validate());
});
