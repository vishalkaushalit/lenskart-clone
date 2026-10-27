import test from 'node:test';
import assert from 'node:assert/strict';
import { slugify, availableSlug, validSlug } from './slugs.js';
import Product from '../models/Product.js';
import CustomerReview from '../models/CustomerReview.js';
import { storefrontProductDetails } from '../controllers/productController.js';
test('slugs normalize names and generated duplicates receive suffixes', async () => {
  assert.equal(slugify('Hustlr Classic / Black'), 'hustlr-classic-black');
  assert.equal(
    await availableSlug(
      { exists: async ({ slug }) => ['frame', 'frame-2'].includes(slug) },
      'Frame',
    ),
    'frame-3',
  );
  assert.equal(validSlug('hustlr-classic'), true);
  assert.equal(validSlug('Bad Slug'), false);
});
test('public product detail resolves active products by slug', async (t) => {
  t.mock.method(CustomerReview, 'find', () => ({
    select() {
      return this;
    },
    sort() {
      return this;
    },
    lean: async () => [],
  }));
  t.mock.method(Product, 'findOne', (filter) => {
    assert.deepEqual(filter, { slug: 'hustlr-classic', status: 'active' });
    return { lean: async () => ({ _id: 'id', slug: 'hustlr-classic' }) };
  });
  let data;
  await storefrontProductDetails(
    { params: { id: 'hustlr-classic' } },
    {
      json: (value) => {
        data = value;
      },
    },
    assert.ifError,
  );
  assert.equal(data.product.slug, 'hustlr-classic');
});
