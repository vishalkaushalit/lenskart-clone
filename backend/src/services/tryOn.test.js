import test from 'node:test';
import assert from 'node:assert/strict';
import Product from '../models/Product.js';
import ProductVariant from '../models/ProductVariant.js';
import { productFields, publicProduct } from '../controllers/productController.js';
import { publicVariant } from './variants.js';

test('try-on images are optional and reject unsafe URLs on products and variants', () => {
  for (const model of [Product, ProductVariant]) {
    const field = model.schema.path('tryOnImage');
    for (const value of ['', '/assets/products/frame.png', 'https://example.com/frame.webp']) assert.equal(field.doValidateSync(value), undefined);
    for (const value of ['javascript:alert(1)', 'data:image/png;base64,abc', '/private/file.png', 'https://example.com/' + 'a'.repeat(2000)]) assert.ok(field.doValidateSync(value));
  }
});
test('try-on image survives the admin fields and public API projection', () => {
  const image = '/assets/products/frame.png';
  assert.deepEqual(productFields({ tryOnImage: image, private: 'hidden' }), { tryOnImage: image });
  assert.equal(publicProduct({ _id: 'product', tryOnImage: image }).tryOnImage, image);
  assert.equal(publicVariant({ _id: 'variant', productId: 'product', tryOnImage: image }).tryOnImage, image);
  assert.equal(publicVariant({ _id: 'variant', productId: 'product' }).tryOnImage, '');
});
