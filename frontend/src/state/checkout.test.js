import test from 'node:test';
import assert from 'node:assert/strict';
import { checkoutRows } from './checkout.js';
test('clearing cart excludes stale fetched products from checkout calculations', () => {
  const items=[{id:'frame',product:{price:1500,stock:10}}];
  assert.deepEqual(checkoutRows(items,[]),[]);
  assert.deepEqual(checkoutRows(items,[{id:'frame',quantity:2}])[0].entry,{id:'frame',quantity:2});
});
test('removing one item preserves quantities only for remaining items', () => {
  const rows=checkoutRows([{id:'removed'},{id:'saved'}],[{id:'saved',quantity:1}]);
  assert.equal(rows.length,1);assert.equal(rows[0].id,'saved');
});
