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
  assert.equal(resolveStorePath('/collection', routes).destination, '/collection');
  assert.equal(resolveStorePath('/collections', routes).path, '/collections');
  assert.equal(resolveStorePath('/collections/eyeglasses', routes).path, '/collection/eyeglasses');
  assert.equal(
    resolveStorePath('/collections/eyeglasses', routes).destination,
    '/collections/eyeglasses',
  );
  assert.equal(
    resolveStorePath('/collection/eyeglasses/classic', routes).destination,
    '/collections/eyeglasses/classic',
  );
  assert.equal(
    resolveStorePath('/collections/eyeglasses/classic', routes).destination,
    '/collections/eyeglasses/classic',
  );
  assert.equal(
    resolveStorePath('/collections/eyeglasses/classic/acetate/', routes).destination,
    '/collections/eyeglasses/classic/acetate',
  );
  assert.equal(
    resolveStorePath('/collection/eyeglasses/classic/acetate/', routes).destination,
    '/collections/eyeglasses/classic/acetate',
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
test('defaults keep the collection index separate from the product listing', () => {
  const routes = prefixRoutes();
  assert.equal(resolveStorePath('/products/blue', routes).destination, '/products/blue');
  assert.equal(resolveStorePath('/collection', routes).destination, '/collection');
  assert.equal(resolveStorePath('/collections', routes).destination, '/collections');
  assert.equal(
    resolveStorePath('/collections/eyeglasses', routes).destination,
    '/collections/eyeglasses',
  );
  assert.equal(
    resolveStorePath('/collections/eyeglasses/classic', routes).destination,
    '/collections/eyeglasses/classic',
  );
  assert.equal(
    resolveStorePath('/collections/eyeglasses/classic/', routes).destination,
    '/collections/eyeglasses/classic',
  );
});
