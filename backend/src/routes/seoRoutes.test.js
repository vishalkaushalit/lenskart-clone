import test from 'node:test';
import assert from 'node:assert/strict';
import PageSeo from '../models/PageSeo.js';
import { adminSeo, publicSeo } from './seoRoutes.js';
import { requireAuth } from '../middleware/auth.js';

const handler = (router, method) => router.stack.find(layer => layer.route?.methods[method]).route.stack[0].handle;
function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}
test('SEO writes require authentication and admin role', () => {
  assert.equal(adminSeo.stack[0].handle, requireAuth);
  const res = response();
  adminSeo.stack[1].handle({ user: { role: 'customer' } }, res, () => assert.fail('customer allowed'));
  assert.equal(res.code, 403);
});
test('SEO rejects query objects, external paths, traversal and invalid images', async () => {
  for (const path of [{ $ne: null }, '//example.com', '/collection?search=x', '/collection/', '/../cart']) {
    const res = response();
    await handler(publicSeo, 'get')({ query: { path } }, res);
    assert.equal(res.code, 400);
  }
  for (const fields of [{ image: 'javascript:alert(1)' }, { title: 'x'.repeat(121) }, { description: {} }]) {
    const res = response();
    await handler(adminSeo, 'put')({ body: { path: '/', ...fields } }, res);
    assert.equal(res.code, 400);
  }
});
test('SEO read returns null when no manual override exists', async t => {
  t.mock.method(PageSeo, 'findOne', query => {
    assert.deepEqual(query, { path: '/' });
    return { select() { return this; }, async lean() { return null; } };
  });
  const res = response();
  await handler(publicSeo, 'get')({ query: { path: '/' } }, res);
  assert.deepEqual(res.body, { seo: null });
});
test('SEO saves trimmed fields and supports clearing overrides', async t => {
  t.mock.method(PageSeo, 'findOneAndUpdate', async (query, update, options) => {
    assert.equal(query.path, '/products/frame');
    assert.deepEqual(update.$set, { title: 'Frame title', description: '', image: '' });
    assert.equal(options.runValidators, true);
    assert.equal(options.upsert, true);
    return update.$set;
  });
  const res = response();
  await handler(adminSeo, 'put')({ body: { path: '/products/frame', title: ' Frame title ', description: ' ' } }, res);
  assert.equal(res.body.seo.title, 'Frame title');
});
