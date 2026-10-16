import test from 'node:test';
import assert from 'node:assert/strict';
import CustomerReview from '../models/CustomerReview.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { canReview, submitReview, orderReviews, moderateReview, approvedReviews, listReviews, deleteReview } from './reviewController.js';
import { storefrontProductDetails } from './productController.js';
import { commerceAdmin } from '../routes/commerceRoutes.js';
import accountRoutes from '../routes/accountRoutes.js';
import { requireAuth } from '../middleware/auth.js';

const orderId = '123456789012345678901234';
const productId = '223456789012345678901234';
const userId = '323456789012345678901234';
const reviewId = '423456789012345678901234';
const delivered = { _id: orderId, status: 'delivered', deliveredAt: new Date('2026-01-01'), items: [{ product: productId }] };
const request = body => ({ params: { id: orderId }, user: { _id: userId, name: 'Customer' }, body: { productId, rating: 5, text: ' Great frame ', ...body } });
function response() { return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }
const query = rows => ({ select() { return this; }, sort() { return this; }, populate() { return this; }, skip() { return this; }, limit() { return this; }, lean: async () => rows });

test('reviews unlock after delivery only for purchased products, with legacy timestamp fallback', () => {
  const now = new Date('2026-02-01');
  assert.equal(canReview(delivered, productId, now), true);
  for (const status of ['pending', 'confirmed', 'shipped', 'cancelled']) assert.equal(canReview({ ...delivered, status }, productId, now), false);
  assert.equal(canReview(delivered, 'other', now), false);
  assert.equal(canReview({ ...delivered, deliveredAt: new Date('2027-01-01') }, productId, now), false);
  assert.equal(canReview({ ...delivered, deliveredAt: null, updatedAt: new Date('2026-01-01') }, productId, now), true);
  assert.equal(canReview({ ...delivered, deliveredAt: null }, productId, now), false);
});

test('customer submission checks ownership and ignores forged approval, author and delivery fields', async t => {
  t.mock.method(Order, 'findOne', filter => { assert.deepEqual(filter, { _id: orderId, user: userId }); return query(delivered); });
  t.mock.method(Product, 'exists', async filter => { assert.deepEqual(filter, { _id: productId }); return true; });
  t.mock.method(CustomerReview, 'create', async fields => {
    assert.deepEqual(fields, { user: userId, order: orderId, product: productId, name: 'Customer', rating: 5, text: 'Great frame', status: 'pending' });
    return fields;
  });
  const res = response();
  await submitReview(request({ status: 'approved', name: 'Fake', user: 'other', deliveredAt: '2000-01-01' }), res, assert.ifError);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.review.status, 'pending');
});

test('missing ownership, undelivered orders and unpurchased products cannot create reviews', async t => {
  let order;
  t.mock.method(Order, 'findOne', () => query(order));
  t.mock.method(CustomerReview, 'create', () => assert.fail('unexpected review'));
  for (const [value, status] of [[null, 404], [{ ...delivered, status: 'shipped' }, 403], [{ ...delivered, items: [] }, 403]]) {
    order = value;
    const res = response(); await submitReview(request(), res, assert.ifError); assert.equal(res.statusCode, status);
  }
});

test('invalid reviews fail before querying and duplicate submissions return conflict', async t => {
  t.mock.method(Order, 'findOne', () => query(delivered));
  t.mock.method(Product, 'exists', async () => true);
  const create = t.mock.method(CustomerReview, 'create', async () => { throw Object.assign(new Error('duplicate'), { code: 11000 }); });
  for (const body of [{ rating: 0 }, { rating: 6 }, { rating: 2.5 }, { rating: '5' }, { text: ' ' }, { text: 'x'.repeat(2001) }, { productId: 'bad' }]) {
    const res = response(); await submitReview(request(body), res, assert.ifError); assert.equal(res.statusCode, 400);
  }
  assert.equal(create.mock.callCount(), 0);
  const res = response(); await submitReview(request(), res, assert.ifError); assert.equal(res.statusCode, 409);
});

test('customer can only retrieve reviews belonging to their own order', async t => {
  t.mock.method(Order, 'findOne', filter => { assert.equal(filter.user, userId); return query(delivered); });
  t.mock.method(CustomerReview, 'find', filter => { assert.deepEqual(filter, { order: orderId, user: userId }); return query([{ status: 'pending' }]); });
  const res = response(); await orderReviews(request(), res, assert.ifError); assert.equal(res.body.reviews[0].status, 'pending');
});

test('moderation atomically accepts only pending reviews and records the admin', async t => {
  t.mock.method(CustomerReview, 'findOneAndUpdate', async (filter, update, options) => {
    assert.deepEqual(filter, { _id: reviewId, status: { $in: ['pending', 'rejected'] } });
    assert.equal(update.$set.status, 'approved'); assert.equal(update.$set.moderatedBy, userId);
    assert.ok(update.$set.moderatedAt instanceof Date); assert.equal(options.runValidators, true);
    return { status: 'approved' };
  });
  const res = response(); await moderateReview({ ...request(), params: { id: reviewId }, body: { status: 'approved' } }, res, assert.ifError);
  assert.equal(res.body.review.status, 'approved');
});

test('already moderated reviews cannot be approved twice', async t => {
  t.mock.method(CustomerReview, 'findOneAndUpdate', async () => null);
  const res = response(); await moderateReview({ ...request(), params: { id: reviewId }, body: { status: 'rejected' } }, res, assert.ifError);
  assert.equal(res.statusCode, 409);
});

test('public reviews expose only approved content without private customer or order IDs', async t => {
  t.mock.method(CustomerReview, 'find', filter => {
    assert.deepEqual(filter, { product: productId, status: 'approved' });
    return query([{ name: 'Customer', rating: 5, text: 'Great', createdAt: new Date('2026-02-01'), user: userId, order: orderId }]);
  });
  const rows = await approvedReviews(productId);
  assert.equal(rows[0].verifiedPurchase, true); assert.equal(rows[0].user, undefined); assert.equal(rows[0].order, undefined);
  t.mock.method(Product, 'findOne', () => query({ _id: productId, reviews: [{ name: 'Legacy', rating: 4 }] }));
  const res = response(); await storefrontProductDetails({ params: { id: productId } }, res, assert.ifError);
  assert.equal(res.body.product.reviews.length, 2); assert.equal(res.body.product.reviews[0].text, 'Great');
});

test('review schema enforces uniqueness and rating validation', async () => {
  assert.ok(CustomerReview.schema.indexes().some(([keys, options]) => keys.order === 1 && keys.product === 1 && options.unique));
  const base = { user: userId, order: orderId, product: productId, name: 'Customer', text: 'Great' };
  await new CustomerReview({ ...base, rating: 5 }).validate();
  for (const rating of [0, 6, 2.5]) await assert.rejects(new CustomerReview({ ...base, rating }).validate());
});

test('review routes require customer authentication and admin role for moderation', async () => {
  assert.equal(accountRoutes.stack[0].handle, requireAuth);
  assert.equal(commerceAdmin.stack[0].handle, requireAuth);
  const roleGuard = commerceAdmin.stack[1].handle;
  const res = response(); roleGuard({ user: { role: 'customer' } }, res, () => assert.fail('customer accessed admin reviews')); assert.equal(res.statusCode, 403);
  assert.ok(accountRoutes.stack.some(layer => layer.route?.path === '/orders/:id/reviews' && layer.route.methods.post));
  assert.ok(commerceAdmin.stack.some(layer => layer.route?.path === '/reviews/:id' && layer.route.methods.patch));
});

test('admin review pagination validates status and page', async () => {
  for (const query of [{ page: '0' }, { page: '1.5' }, { status: 'invalid' }]) {
    const res = response(); await listReviews({ query }, res, assert.ifError); assert.equal(res.statusCode, 400);
  }
});

test('marking an order delivered records the server time and repeated updates preserve it', async t => {
  const { default: mongoose } = await import('mongoose');
  const session = { withTransaction: async callback => callback(), endSession: async () => {} };
  t.mock.method(mongoose, 'startSession', async () => session);
  const order = { status: 'shipped', items: [], save: async options => assert.equal(options.session, session) };
  t.mock.method(Order, 'findById', () => ({ session: async () => order }));
  const handler = commerceAdmin.stack.find(layer => layer.route?.path === '/orders/:id' && layer.route.methods.patch).route.stack[0].handle;
  const before = Date.now();
  const req = { params: { id: orderId }, body: { status: 'delivered', deliveredAt: '2000-01-01' } };
  await handler(req, response(), assert.ifError);
  assert.equal(order.status, 'delivered');
  assert.ok(order.deliveredAt.getTime() >= before);
  const timestamp = order.deliveredAt;
  await handler(req, response(), assert.ifError);
  assert.equal(order.deliveredAt, timestamp);
});

test('review submission unlocks exactly 48 hours after delivery', async t => {
  const delivery = new Date('2026-01-01T10:30:00Z');
  const order = { ...delivered, deliveredAt: delivery };
  assert.equal(canReview(order, productId, new Date('2026-01-03T10:29:59.999Z')), false);
  assert.equal(canReview(order, productId, new Date('2026-01-03T10:30:00Z')), true);
  assert.equal(canReview(order, productId, new Date('2026-01-03T10:30:00.001Z')), true);
  // Even a forged client request is rejected during the waiting period.
  t.mock.method(Order, 'findOne', () => query({ ...delivered, deliveredAt: new Date(Date.now() - 47 * 60 * 60 * 1000) }));
  t.mock.method(CustomerReview, 'create', () => assert.fail('review created before 48 hours'));
  const res = response(); await submitReview(request(), res, assert.ifError);
  assert.equal(res.statusCode, 403); assert.match(res.body.message, /48 hours/);
});

test('order review eligibility exposes the server unlock time during the waiting period', async t => {
  const delivery = new Date();
  t.mock.method(Order, 'findOne', () => query({ ...delivered, deliveredAt: delivery }));
  t.mock.method(CustomerReview, 'find', () => query([]));
  const res = response(); await orderReviews(request(), res, assert.ifError);
  assert.equal(res.body.canSubmit, false);
  assert.equal(res.body.availableAt.getTime(), delivery.getTime() + 48 * 60 * 60 * 1000);
});

test('product reviews are sorted newest first across approved purchases and existing reviews', async t => {
  t.mock.method(CustomerReview, 'find', () => query([{ name: 'Buyer', rating: 5, text: 'Purchased', createdAt: new Date('2026-02-01') }]));
  t.mock.method(Product, 'findOne', () => query({ _id: productId, reviews: [
    { name: 'Older', rating: 4, date: new Date('2026-01-01') },
    { name: 'Newer', rating: 4, date: new Date('2026-03-01') },
  ] }));
  const res = response(); await storefrontProductDetails({ params: { id: productId } }, res, assert.ifError);
  assert.deepEqual(res.body.product.reviews.map(row => row.name), ['Newer', 'Buyer', 'Older']);
  assert.equal(res.body.product.reviews[1].verifiedPurchase, true);
  assert.equal(res.body.product.reviews[0].verifiedPurchase, undefined);
});

test('admin queue defaults to all statuses and retains explicit status filtering', async t => {
  let counted;
  t.mock.method(CustomerReview, 'countDocuments', async filter => { counted = filter; return 3; });
  t.mock.method(CustomerReview, 'find', filter => { assert.deepEqual(filter, counted); return query([{ status: 'pending' }, { status: 'approved' }, { status: 'rejected' }]); });
  for (const [params, expected] of [[{}, {}], [{ status: 'all' }, {}], [{ status: 'unapproved' }, { status: { $in: ['pending', 'rejected'] } }], [{ status: 'pending' }, { status: 'pending' }], [{ status: 'approved' }, { status: 'approved' }], [{ status: 'rejected' }, { status: 'rejected' }]]) {
    const res = response(); await listReviews({ query: params }, res, assert.ifError);
    assert.deepEqual(counted, expected); assert.equal(res.body.total, 3);
  }
});

test('unapprove atomically returns only approved reviews to the pending queue', async t => {
  t.mock.method(CustomerReview, 'findOneAndUpdate', async (filter, update) => {
    assert.deepEqual(filter, { _id: reviewId, status: 'approved' });
    assert.equal(update.$set.status, 'pending');
    assert.equal(update.$set.moderatedBy, userId);
    assert.ok(update.$set.moderatedAt instanceof Date);
    return { status: 'pending' };
  });
  const res = response(); await moderateReview({ ...request(), params: { id: reviewId }, body: { status: 'pending' } }, res, assert.ifError);
  assert.equal(res.body.review.status, 'pending');
});
test('unapprove rejects missing or already unapproved reviews', async t => {
  t.mock.method(CustomerReview, 'findOneAndUpdate', async () => null);
  const res = response(); await moderateReview({ ...request(), params: { id: reviewId }, body: { status: 'pending' } }, res, assert.ifError);
  assert.equal(res.statusCode, 409);
});

test('admins can delete a review and missing or invalid IDs return useful errors', async t => {
  const remove = t.mock.method(CustomerReview, 'findByIdAndDelete', async id => { assert.equal(id, reviewId); return { _id: id }; });
  const res = response(); await deleteReview({ params: { id: reviewId } }, res, assert.ifError);
  assert.equal(res.body.success, true);
  const invalid = response(); await deleteReview({ params: { id: 'bad' } }, invalid, assert.ifError);
  assert.equal(invalid.statusCode, 400); assert.equal(remove.mock.callCount(), 1);
  t.mock.method(CustomerReview, 'findByIdAndDelete', async () => null);
  const missing = response(); await deleteReview({ params: { id: reviewId } }, missing, assert.ifError);
  assert.equal(missing.statusCode, 404);
  assert.ok(commerceAdmin.stack.some(layer => layer.route?.path === '/reviews/:id' && layer.route.methods.delete));
});
