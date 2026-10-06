import test from 'node:test';
import assert from 'node:assert/strict';
import { searchTerms, textSearch } from './search.js';

test('search validates input and treats regex characters as literal text', () => {
  assert.deepEqual(searchTerms('  a+b  (test) '), ['a\\+b', '\\(test\\)']);
  assert.deepEqual(searchTerms(), []);
  for (const value of [{}, ['a'], 'a'.repeat(101)]) assert.throws(() => searchTerms(value), /100 characters/);
});
test('every term can match a different field and blank searches are unrestricted', () => {
  assert.deepEqual(textSearch([], ['name']), {});
  const filter = textSearch(searchTerms('john jacobs'), ['name', 'email']);
  assert.equal(filter.$and.length, 2);
  assert.equal(filter.$and[1].$or[1].email.$regex, 'jacobs');
});
