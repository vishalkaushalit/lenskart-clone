import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesSearch, searchDestination } from './search.js';

test('admin search stays in the selected resource and defaults to products', () => {
  for (const path of ['/product', '/users', '/categories', '/orders', '/coupons']) assert.equal(searchDestination(path).path, path);
  assert.equal(searchDestination('/orders/123').path, '/orders');
  assert.equal(searchDestination('/dashboard').path, '/product');
});
test('admin searches combine fields and ignore case, punctuation and whitespace', () => {
  assert.equal(matchesSearch(['John Jacobs', 'Black', 'Cat Eye', 'frame-3'], ' black  jacobs cat-eye '), true);
  assert.equal(matchesSearch(['Eyeglasses', 'Round'], 'round sunglasses'), false);
  assert.equal(matchesSearch(['Round'], ''), true);
});
