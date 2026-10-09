import test from 'node:test';
import assert from 'node:assert/strict';
import Order from '../models/Order.js';
import Coupon from '../models/Coupon.js';
import { commerceAdmin } from './commerceRoutes.js';

for (const [path, model, key] of [['/orders', Order, 'orders'], ['/coupons', Coupon, 'coupons']]) {
  test(`${path} starts count and page queries together and preserves pagination`, { timeout: 1000 }, async t => {
    let resolveCount;
    let countStarted = false;
    t.mock.method(model, 'countDocuments', () => {
      countStarted = true;
      return new Promise(resolve => { resolveCount = resolve; });
    });
    t.mock.method(model, 'find', () => ({
      populate() { return this; },
      sort(order) { assert.deepEqual(order, { createdAt: -1, _id: -1 }); return this; },
      skip(offset) { assert.equal(offset, 20); return this; },
      limit(size) { assert.equal(size, 20); return this; },
      async lean() {
        assert.equal(countStarted, true);
        resolveCount(21);
        return [{ _id: 'record' }];
      },
    }));
    const handler = commerceAdmin.stack.find(layer => layer.route?.path === path && layer.route.methods.get).route.stack.at(-1).handle;
    let body;
    await handler({ query: { page: '2' } }, { json(data) { body = data; } }, assert.ifError);
    assert.equal(body.total, 21);
    assert.equal(body.page, 2);
    assert.equal(body[key][0]._id, 'record');
  });
}
