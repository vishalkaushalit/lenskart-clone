import test from 'node:test';
import assert from 'node:assert/strict';
import { tryOnPlacement } from './tryOnPlacement.js';
import { resolveVariant } from '../state/productVariants.js';

const landmarks = [];
landmarks[33] = { x: 0.3, y: 0.4 };
landmarks[263] = { x: 0.7, y: 0.4 };
test('frame tracks eye midpoint, tilt and user adjustments', () => {
  const frame = tryOnPlacement(landmarks, 640, 480, 3);
  assert.equal(frame.x, 320);
  assert.equal(frame.y, 192);
  assert.equal(frame.angle, 0);
  const adjusted = tryOnPlacement(landmarks, 640, 480, 3, 1.2, 0.05);
  assert.equal(adjusted.width, frame.width * 1.2);
  assert.equal(adjusted.y, frame.y + 24);
  const tilted = [...landmarks];
  tilted[263] = { x: 0.7, y: 0.5 };
  assert.ok(tryOnPlacement(tilted, 640, 480, 3).angle > 0);
});
test('no frame is drawn for missing, invalid or tiny eye spans', () => {
  for (const input of [undefined, [], Array(264).fill({ x: 0.5, y: 0.5 }), Array(264).fill({ x: NaN, y: 0.5 })]) {
    assert.equal(tryOnPlacement(input, 640, 480, 3), null);
  }
  assert.equal(tryOnPlacement(landmarks, 640, 480, 0), null);
});
test('variant preview never inherits an image of another frame color', () => {
  const product = { hasVariants: true, color: 'Black', tryOnImage: 'black.png', price: 100, variants: [{ id: 'blue', size: 'M', color: 'Blue', status: 'active', images: [] }] };
  assert.equal(resolveVariant(product, { size: 'M', color: 'Blue' }).tryOnImage, '');
  product.variants[0].tryOnImage = 'blue.png';
  assert.equal(resolveVariant(product, { size: 'M', color: 'Blue' }).tryOnImage, 'blue.png');
});
test('same-color variants inherit the product try-on image and can override it', () => {
  const product = { hasVariants: true, color: ' Black ', tryOnImage: 'black.png', price: 100, variants: [{ id: 'black', size: 'L', color: 'BLACK', status: 'active', images: [] }] };
  assert.equal(resolveVariant(product, { size: 'L', color: 'Black' }).tryOnImage, 'black.png');
  product.variants[0].tryOnImage = 'large-black.png';
  assert.equal(resolveVariant(product, { size: 'L', color: 'Black' }).tryOnImage, 'large-black.png');
  product.variants[0].tryOnImage = '';
  product.color = '';
  assert.equal(resolveVariant(product, { size: 'L', color: 'Black' }).tryOnImage, '');
});
test('one color image is reused across sizes without leaking into other colors', () => {
  const product = { hasVariants: true, variants: [
    { id: 's', size: 'S', color: ' Black ', tryOnImage: 'black.png', status: 'active', images: [] },
    { id: 'm', size: 'M', color: 'Black', status: 'active', images: [] },
    { id: 'l', size: 'L', color: 'Blue', status: 'active', images: [] },
  ] };
  assert.equal(resolveVariant(product, { size: 'M', color: 'Black' }).tryOnImage, 'black.png');
  assert.equal(resolveVariant(product, { size: 'L', color: 'Blue' }).tryOnImage, '');
  product.variants[1].tryOnImage = 'custom.png';
  assert.equal(resolveVariant(product, { size: 'M', color: 'Black' }).tryOnImage, 'custom.png');
});
test('all sizes and colors retain one combined product review list', () => {
  const reviews = [{ name: 'Buyer', rating: 5, text: 'Good frame', verifiedPurchase: true }];
  const product = { hasVariants: true, reviews, variants: [
    { id: 'black-s', color: 'Black', size: 'S', status: 'active', images: [] },
    { id: 'black-l', color: 'Black', size: 'L', status: 'active', images: [] },
    { id: 'blue-m', color: 'Blue', size: 'M', status: 'active', images: [] },
  ] };
  for (const variant of product.variants) {
    const selected = resolveVariant(product, { color: variant.color, size: variant.size });
    assert.equal(selected.reviews, reviews);
    assert.equal(selected.reviews[0].verifiedPurchase, true);
  }
});
