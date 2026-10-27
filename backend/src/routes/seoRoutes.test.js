import SiteSeo from '../models/SiteSeo.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import PageSeo from '../models/PageSeo.js';
import { adminSeo, publicSeo } from './seoRoutes.js';
import { requireAuth } from '../middleware/auth.js';

test.beforeEach((t) => {
  t.mock.method(SiteSeo, 'findOne', () => ({
    async lean() {
      return {};
    },
  }));
});

const handler = (router, method) =>
  router.stack.find((layer) => layer.route?.path === '/' && layer.route?.methods[method]).route
    .stack[0].handle;
function response() {
  return {
    code: 200,
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
test('SEO writes require authentication and admin role', () => {
  assert.equal(adminSeo.stack[0].handle, requireAuth);
  const res = response();
  adminSeo.stack[1].handle({ user: { role: 'customer' } }, res, () =>
    assert.fail('customer allowed'),
  );
  assert.equal(res.code, 403);
});
test('SEO rejects query objects, external paths, traversal and invalid images', async () => {
  for (const path of [
    { $ne: null },
    '//example.com',
    '/collection?search=x',
    '/collection/',
    '/../cart',
  ]) {
    const res = response();
    await handler(publicSeo, 'get')({ query: { path } }, res);
    assert.equal(res.code, 400);
  }
  for (const fields of [
    { image: 'javascript:alert(1)' },
    { title: 'x'.repeat(121) },
    { description: {} },
  ]) {
    const res = response();
    await handler(adminSeo, 'put')({ body: { path: '/', ...fields } }, res);
    assert.equal(res.code, 400);
  }
});
test('SEO read returns null when no manual override exists', async (t) => {
  t.mock.method(PageSeo, 'findOne', (query) => {
    assert.deepEqual(query, { path: '/' });
    return {
      select() {
        return this;
      },
      async lean() {
        return null;
      },
    };
  });
  const res = response();
  await handler(publicSeo, 'get')({ query: { path: '/' } }, res);
  assert.deepEqual(res.body, { seo: null });
});
test('SEO saves trimmed fields and supports clearing overrides', async (t) => {
  t.mock.method(PageSeo, 'findOneAndUpdate', async (query, update, options) => {
    assert.equal(query.path, '/products/frame');
    assert.deepEqual(update.$set, { title: 'Frame title', description: '', image: '' });
    assert.equal(options.runValidators, true);
    assert.equal(options.upsert, true);
    return update.$set;
  });
  const res = response();
  await handler(adminSeo, 'put')(
    { body: { path: '/products/frame', title: ' Frame title ', description: ' ' } },
    res,
  );
  assert.equal(res.body.seo.title, 'Frame title');
});

test('SEO validates FAQ content and keywords before saving', async () => {
  for (const fields of [
    { keywords: {} },
    { keywords: 'x'.repeat(1001) },
    { faqs: {} },
    { faqs: [{ question: '', answer: 'Answer' }] },
    { faqs: [{ question: 'Question', answer: 'x'.repeat(1001) }] },
  ]) {
    const res = response();
    await handler(adminSeo, 'put')({ body: { path: '/', ...fields } }, res);
    assert.equal(res.code, 400);
  }
});
test('SEO saves trimmed FAQs and keywords and allows clearing them', async (t) => {
  const writes = [];
  t.mock.method(PageSeo, 'findOneAndUpdate', async (_, update) => {
    writes.push(update.$set);
    return update.$set;
  });
  await handler(adminSeo, 'put')(
    {
      body: {
        path: '/',
        keywords: ' frames, glasses ',
        faqs: [{ question: ' Question? ', answer: ' Answer ' }],
      },
    },
    response(),
  );
  assert.equal(writes[0].keywords, 'frames, glasses');
  assert.deepEqual(writes[0].faqs, [{ question: 'Question?', answer: 'Answer' }]);
  await handler(adminSeo, 'put')({ body: { path: '/', keywords: '', faqs: [] } }, response());
  assert.equal(writes[1].keywords, '');
  assert.deepEqual(writes[1].faqs, []);
});

test('SEO indexing accepts booleans and preserves explicit false', async (t) => {
  t.mock.method(PageSeo, 'findOneAndUpdate', async (_, update) => update.$set);
  for (const noindex of [true, false]) {
    const res = response();
    await handler(adminSeo, 'put')({ body: { path: '/', noindex } }, res);
    assert.equal(res.body.seo.noindex, noindex);
  }
  const res = response();
  await handler(adminSeo, 'put')({ body: { path: '/', noindex: 'false' } }, res);
  assert.equal(res.code, 400);
});

test('page URL changes save the new path and optional redirect history', async (t) => {
  t.mock.method(PageSeo, 'findOne', (query) => ({
    async lean() {
      return query.$or
        ? null
        : { path: '/wishlist', urlPath: '/saved-frames', redirects: ['/wishlist'] };
    },
  }));
  t.mock.method(PageSeo, 'findOneAndUpdate', async (_, update) => update.$set);
  const res = response();
  await handler(adminSeo, 'put')(
    { body: { path: '/wishlist', urlPath: '/favorites', redirectOld: true } },
    res,
  );
  assert.equal(res.body.seo.urlPath, '/favorites');
  assert.deepEqual(res.body.seo.redirects, ['/wishlist', '/saved-frames']);
  const noRedirect = response();
  await handler(adminSeo, 'put')(
    { body: { path: '/wishlist', urlPath: '/favorites', redirectOld: false } },
    noRedirect,
  );
  assert.deepEqual(noRedirect.body.seo.redirects, []);
});
test('page URL changes reject reserved routes and occupied paths', async (t) => {
  for (const urlPath of ['/api/seo', '/admin/settings', '/products/new', '/cart', '/../bad']) {
    const res = response();
    await handler(adminSeo, 'put')(
      { body: { path: '/wishlist', urlPath, redirectOld: true } },
      res,
    );
    assert.equal(res.code, 400);
  }
  t.mock.method(PageSeo, 'findOne', () => ({
    async lean() {
      return { path: '/collection' };
    },
  }));
  const res = response();
  await handler(adminSeo, 'put')(
    { body: { path: '/wishlist', urlPath: '/taken', redirectOld: true } },
    res,
  );
  assert.equal(res.code, 409);
});
