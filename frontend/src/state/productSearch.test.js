import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesSearch } from './productSearch.js';

const product = { name: 'Icons Slim', brand: 'John Jacobs', shape: 'Cat Eye', color: 'Black', productType: 'Eyeglasses', features: ['Lightweight frame'] };
test('search combines words across product attributes in any order', () => {
  for (const query of ['black john jacobs', 'Jacobs BLACK', 'cat-eye eyeglasses', 'lightweight black']) assert.equal(matchesSearch(product, query), true);
  assert.equal(matchesSearch(product, 'black round'), false);
  assert.equal(matchesSearch(product, 'sunglasses'), false);
});
test('empty searches show all products and missing optional fields are safe', () => {
  assert.equal(matchesSearch({}, '   '), true);
  assert.equal(matchesSearch({}, 'square'), false);
  assert.equal(matchesSearch({ name: 'Café Frame' }, 'cafe'), true);
});
