import test from 'node:test';
import assert from 'node:assert/strict';
import { imageExtension, uploadProductImage, uploadFilename, blobStorageConfigured } from './productImages.js';
import { publicProduct, saveProduct } from '../controllers/productController.js';
import Product from '../models/Product.js';
test('uploads check image signatures rather than filename or MIME alone', () => {
  assert.equal(imageExtension(Buffer.from([137,80,78,71,13,10,26,10])),'png');
  assert.equal(imageExtension(Buffer.from([255,216,255,0])),'jpg');
  assert.equal(imageExtension(Buffer.from('RIFF0000WEBP')),'webp');
  assert.equal(imageExtension(Buffer.from('<svg></svg>')),null);
  assert.equal(imageExtension('not binary'),null);
});
test('invalid upload data is rejected', async () => {
  const res={status(code){this.code=code;return this;},json(body){this.body=body;}};
  await uploadProductImage({body:Buffer.from('not an image')},res,assert.ifError);
  assert.equal(res.code,400);
});
test('legacy images have a gallery fallback and multi-image products preserve order', () => {
  assert.deepEqual(publicProduct({_id:'id',image:'/assets/products/a.png'}).images,['/assets/products/a.png']);
  assert.deepEqual(publicProduct({_id:'id',image:'a',images:['a','b']}).images,['a','b']);
});
test('saving a gallery sets its first image as the cover', async (t) => {
  t.mock.method(Product,'exists',async()=>null);
  t.mock.method(Product,'create', async (fields) => {
    assert.equal(fields.image,'/assets/products/a.png');
    assert.deepEqual(fields.images,['/assets/products/a.png','/assets/products/b.png']);
    return {_id:'id',...fields};
  });
  const res={status(code){this.code=code;return this;},json(body){this.body=body;}};
  await saveProduct({params:{},body:{images:['/assets/products/a.png','/assets/products/b.png']}},res,assert.ifError);
  assert.equal(res.code,201);
});
test('empty and oversized galleries are rejected', async () => {
  for (const images of [[],Array(9).fill('/assets/products/a.png'),['a',{}]]) {
    const res={status(code){this.code=code;return this;},json(){}};
    await saveProduct({params:{},body:{images}},res,assert.ifError);
    assert.equal(res.code,400);
  }
});

test('upload basenames are readable, bounded and safe for storage', () => {
  assert.equal(uploadFilename(encodeURIComponent('Eyeglasses Square.webp')), 'eyeglasses-square');
  assert.equal(uploadFilename(encodeURIComponent('../../Sunglasses Round.png')), 'sunglasses-round');
  assert.equal(uploadFilename('%invalid'), 'product');
  assert.equal(uploadFilename(), 'product');
  assert.equal(uploadFilename('a'.repeat(200) + '.jpg').length, 80);
});

test('hosted storage requires a read-write token or complete OIDC credentials', () => {
  assert.equal(blobStorageConfigured({}), false);
  assert.equal(blobStorageConfigured({ VERCEL: '1' }), false);
  assert.equal(blobStorageConfigured({ BLOB_STORE_ID: 'store' }), false);
  assert.equal(blobStorageConfigured({ VERCEL_OIDC_TOKEN: 'oidc' }), false);
  assert.equal(blobStorageConfigured({ BLOB_READ_WRITE_TOKEN: 'token' }), true);
  assert.equal(blobStorageConfigured({ BLOB_STORE_ID: 'store', VERCEL_OIDC_TOKEN: 'oidc' }), true);
});
