import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import router from '../routes/dashboardRoutes.js';
import { requireAuth } from '../middleware/auth.js';
import { dashboardRange, salesSeries, change, dashboardSummary } from './dashboardController.js';

test('dashboard calendar ranges use India midnight and include today', () => {
  const range = dashboardRange('7', new Date('2026-10-06T01:00:00Z'));
  assert.equal(range.start.toISOString(), '2026-09-29T18:30:00.000Z');
  assert.equal(range.end.toISOString(), '2026-10-06T18:30:00.000Z');
  assert.equal(range.previousStart.toISOString(), '2026-09-22T18:30:00.000Z');
  assert.equal(dashboardRange('30').days, 30);
  for (const value of ['0', '365', ['7'], 'bad']) assert.throws(() => dashboardRange(value));
});
test('charts include zero-sales days and changes avoid a zero baseline', () => {
  const series = salesSeries(dashboardRange('7', new Date('2026-10-06T00:00:00Z')), [{ _id: '2026-10-01', revenue: 1500 }]);
  assert.equal(series.length, 7);
  assert.deepEqual(series[0], { date: '2026-09-30', revenue: 0 });
  assert.equal(series[1].revenue, 1500);
  assert.equal(change(20, 10), 100);
  assert.equal(change(0, 10), -100);
  assert.equal(change(10, 0), null);
});
test('dashboard is restricted to admins', () => {
  assert.equal(router.stack[0].handle, requireAuth);
  let code;
  router.stack[1].handle({ user: { role: 'customer' } }, { status(value){code=value;return this;},json(){} }, () => assert.fail('customer accessed dashboard'));
  assert.equal(code, 403);
});
test('dashboard aggregates live data and exposes only recent-order display fields', async t => {
  t.mock.method(mongoose.connection, 'collection', () => ({ find: () => ({ async *[Symbol.asyncIterator]() {} }) }));
  t.mock.method(User, 'countDocuments', async filter => filter._id ? 0 : 5);
  t.mock.method(Product, 'countDocuments', async () => 9);
  t.mock.method(Order, 'aggregate', async pipeline => {
    assert.equal(pipeline[1].$facet.sales[0].$match.status, 'delivered');
    assert.equal(pipeline[1].$facet.sales[1].$group._id.$dateToString.timezone, 'Asia/Kolkata');
    return [{ current: [{ orders: 3, pending: 1, completed: 1, revenue: 1500 }], previous: [{ orders: 2, revenue: 1000 }], statuses: [{ _id: 'delivered', count: 1 }, { _id: 'pending', count: 1 }, { _id: 'cancelled', count: 1 }], sales: [] }];
  });
  t.mock.method(Order, 'find', () => ({ select(){return this;},populate(){return this;},sort(){return this;},skip(value){assert.equal(value,5);return this;},limit(value){assert.equal(value,5);return this;},lean:async()=>[{_id:'order',orderId:12,shipping:{name:'Customer',phone:'private'},totalAmount:1500,status:'delivered',createdAt:new Date()}] }));
  let result;
  await dashboardSummary({ query: { days: '7',recentPage:'2' } }, { json(value){result=value;} }, assert.ifError);
  assert.equal(result.stats.users, 5);
  assert.equal(result.stats.inactiveUsers, 5);
  assert.equal(result.stats.products, 9);
  assert.equal(result.changes.revenue, 50);
  assert.equal(result.statuses.find(row=>row.status==='cancelled').count, 1);
  assert.equal(result.recentOrders[0].customer, 'Customer');
  assert.deepEqual(result.recentPagination,{page:2,pageSize:5,total:3});
  assert.equal(result.recentOrders[0].shipping, undefined);
});
test('empty dashboard returns zeroes and invalid ranges do not query the database', async t => {
  t.mock.method(mongoose.connection, 'collection', () => ({ find: () => ({ async *[Symbol.asyncIterator]() {} }) }));
  t.mock.method(User, 'countDocuments', async () => 0);
  t.mock.method(Product, 'countDocuments', async () => 0);
  t.mock.method(Order, 'aggregate', async () => []);
  t.mock.method(Order, 'find', () => ({select(){return this;},populate(){return this;},sort(){return this;},skip(){return this;},limit(){return this;},lean:async()=>[]}));
  let result;
  await dashboardSummary({query:{}},{json(value){result=value;}},assert.ifError);
  assert.equal(result.stats.revenue,0);
  assert.equal(result.sales.length,7);
  assert.deepEqual(result.recentOrders,[]);
  let status;
  await dashboardSummary({query:{days:'oops'}},{status(value){status=value;return this;},json(){}},assert.ifError);
  assert.equal(status,400);
});

test('invalid recent-order pagination is rejected before database reads',async t=>{
 t.mock.method(User,'countDocuments',()=>assert.fail('Invalid page queried database'));
 let status;await dashboardSummary({query:{recentPage:'0'}},{status(code){status=code;return this;},json(){}},assert.ifError);assert.equal(status,400);
});
