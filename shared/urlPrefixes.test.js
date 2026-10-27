import test from 'node:test';
import assert from 'node:assert/strict';
import { prefixRoutes, resolveStorePath } from './urlPrefixes.js';
test('prefixes preserve product handles, reviews and historical redirects', () => {
  const routes = prefixRoutes({
    productPrefix: '/frames',
    productPrefixHistory: ['/glasses'],
    collectionPrefix: '/collections',
  });
  for (const path of ['/products/blue/reviews', '/glasses/blue/reviews', '/frames/blue/reviews'])
    assert.deepEqual(resolveStorePath(path, routes).destination, '/frames/blue/reviews');
  assert.equal(resolveStorePath('/frames/blue', routes).path, '/products/blue');
  assert.equal(resolveStorePath('/collection', routes).destination, '/collections');
  assert.equal(resolveStorePath('/collections', routes).path, '/collection');
  assert.equal(resolveStorePath('/collections/eyeglasses', routes).path, '/collection/eyeglasses');
  assert.equal(
    resolveStorePath('/collections/eyeglasses', routes).destination,
    '/collections/eyeglasses',
  );
  assert.equal(
    resolveStorePath('/collection/eyeglasses', prefixRoutes({ collectionPrefix: '/collection' }))
      .destination,
    '/collections/eyeglasses',
  );
  assert.equal(
    resolveStorePath('/shop/eyeglasses', prefixRoutes({ collectionPrefix: '/shop' })).destination,
    '/collections/eyeglasses',
  );
  assert.equal(
    resolveStorePath(
      '/old-collections/eyeglasses',
      prefixRoutes({
        collectionPrefix: '/collections',
        collectionPrefixHistory: ['/old-collections'],
      }),
    ).destination,
    '/collections/eyeglasses',
  );
  assert.equal(resolveStorePath('/api/products/blue', routes).destination, '/api/products/blue');
});
test('defaults use the plural Shopify-style collection prefix', () => {
  const routes = prefixRoutes();
  assert.equal(resolveStorePath('/products/blue', routes).destination, '/products/blue');
  assert.equal(
    resolveStorePath('/collections/eyeglasses', routes).destination,
    '/collections/eyeglasses',
  );
});
