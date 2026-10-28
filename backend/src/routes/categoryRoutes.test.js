import test from 'node:test';
import assert from 'node:assert/strict';
import Category from '../models/Category.js';
import { adminCategories, publicCategories } from './categoryRoutes.js';
import { requireAuth } from '../middleware/auth.js';
test('category management requires authentication and an admin role', () => {
  assert.equal(adminCategories.stack[0].handle, requireAuth);
  let status;
  adminCategories.stack[1].handle(
    { user: { role: 'customer' } },
    {
      status(code) {
        status = code;
        return this;
      },
      json() {},
    },
    () => assert.fail('customer allowed'),
  );
  assert.equal(status, 403);
});
test('public categories include nested descendants but omit inactive parent branches', async (t) => {
  t.mock.method(Category, 'find', () => ({
    sort() {
      return this;
    },
    async lean() {
      return [
        { _id: 'root', name: 'Eyeglasses', parent: null },
        { _id: 'child', name: 'Classic', parent: 'root' },
        { _id: 'grandchild', name: 'Acetate', parent: 'child' },
        { _id: 'hidden-child', name: 'Hidden', parent: 'inactive' },
        { _id: 'hidden-grandchild', name: 'Hidden leaf', parent: 'hidden-child' },
      ];
    },
  }));
  let data;
  await publicCategories.stack[0].route.stack[0].handle(
    {},
    {
      json(body) {
        data = body;
      },
    },
    assert.ifError,
  );
  assert.deepEqual(
    data.categories.map((row) => row._id),
    ['root', 'child', 'grandchild'],
  );
});
test('category model rejects empty and oversized names', async () => {
  await new Category({ name: 'Eyeglasses' }).validate();
  await assert.rejects(new Category({ name: '' }).validate());
  await assert.rejects(new Category({ name: 'x'.repeat(101) }).validate());
});
test('category creation accepts a parent at any existing depth', async (t) => {
  const root = '123456789012345678901234';
  const child = '123456789012345678901235';
  t.mock.method(Category, 'findById', async (id) =>
    String(id) === child
      ? { _id: child, parent: root }
      : String(id) === root
        ? { _id: root, parent: null }
        : null,
  );
  t.mock.method(Category.prototype, 'save', async function () {
    return this;
  });
  let result;
  const route = adminCategories.stack.find(
    (layer) => layer.route?.path === '/' && layer.route.methods.post,
  ).route.stack[0].handle;
  await route(
    {
      params: {},
      body: { name: 'Acetate', slug: 'acetate', parent: child },
    },
    {
      status(code) {
        this.code = code;
        return this;
      },
      json(body) {
        result = { code: this.code, body };
      },
    },
    assert.ifError,
  );
  assert.equal(result.code, 201);
  assert.equal(String(result.body.category.parent), child);
});
test('category slugs are generated, stable on rename and globally unique', async () => {
  const category = new Category({ name: 'Kids Glasses' });
  await category.validate();
  assert.equal(category.slug, 'kids-glasses');
  category.name = 'Children Glasses';
  await category.validate();
  assert.equal(category.slug, 'kids-glasses');
  await assert.rejects(new Category({ name: 'Invalid', slug: 'Bad Slug' }).validate());
  const index = Category.schema.indexes().find(([fields]) => fields.slug === 1);
  assert.equal(index[0].parent, undefined);
  assert.equal(index[1].unique, true);
});
