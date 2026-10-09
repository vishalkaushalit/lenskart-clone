import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestClient } from './requestClient.js';

function fixture() {
  const calls = [];
  const request = createRequestClient('/api', (url, options) => new Promise(resolve => calls.push({ url, options, resolve })));
  const finish = (index, data = { success: true }, status = 200) => calls[index].resolve({ ok: status < 400, status, json: async () => data });
  return { calls, request, finish };
}
const tick = () => new Promise(resolve => queueMicrotask(resolve));
test('concurrent GETs share a request; completed responses are not cached', async () => {
  const f = fixture();
  const a = f.request('/products'); const b = f.request('/products');
  await tick(); assert.equal(f.calls.length, 1);
  f.finish(0); assert.deepEqual(await a, await b);
  const c = f.request('/products'); await tick(); assert.equal(f.calls.length, 2);
  f.finish(1); await c;
});
test('Strict Mode cleanup does not cancel a new subscriber', async () => {
  const f = fixture(); const controller = new AbortController();
  const a = f.request('/products', { signal: controller.signal });
  const rejected = assert.rejects(a, { name: 'AbortError' });
  controller.abort();
  const b = f.request('/products'); await tick();
  assert.equal(f.calls.length, 1); assert.equal(f.calls[0].options.signal.aborted, false);
  f.finish(0); await b; await rejected;
});
test('one subscriber can cancel without cancelling other callers', async () => {
  const f = fixture(); const controller = new AbortController();
  const a = f.request('/products', { signal: controller.signal }); const b = f.request('/products');
  await tick(); const rejected = assert.rejects(a, { name: 'AbortError' }); controller.abort();
  await tick(); assert.equal(f.calls[0].options.signal.aborted, false);
  f.finish(0); await b; await rejected;
});
test('abandoned reads cancel and failures can be retried', async () => {
  const f = fixture(); const controller = new AbortController();
  const a = f.request('/products', { signal: controller.signal }); await tick();
  const rejected = assert.rejects(a, { name: 'AbortError' }); controller.abort(); await tick();
  assert.equal(f.calls[0].options.signal.aborted, true); await rejected; f.finish(0);
  const b = f.request('/products'); await tick();
  const failed = assert.rejects(b, { status: 503 }); f.finish(1, { message: 'Unavailable' }, 503); await failed;
  const c = f.request('/products'); await tick(); assert.equal(f.calls.length, 3); f.finish(2); await c;
});
test('writes and different queries remain independent; mutation separates new reads', async () => {
  const f = fixture();
  const promises = [f.request('/products?all=1'), f.request('/products'), f.request('/auth/logout', { method: 'POST' }), f.request('/auth/logout', { method: 'POST' }), f.request('/products')];
  await tick(); assert.equal(f.calls.length, 5);
  f.calls.forEach((_, index) => f.finish(index)); await Promise.all(promises);
});
test('shared client preserves upload headers without forcing JSON', async () => {
  const f = fixture();
  const upload = f.request('/admin/products/images', { method: 'POST', body: new Blob(['image']), headers: { 'Content-Type': 'image/png' } });
  const form = f.request('/upload', { method: 'POST', body: new FormData() });
  await tick();
  assert.equal(f.calls[0].options.headers.get('Content-Type'), 'image/png');
  assert.equal(f.calls[1].options.headers.has('Content-Type'), false);
  f.finish(0); f.finish(1); await Promise.all([upload, form]);
});
