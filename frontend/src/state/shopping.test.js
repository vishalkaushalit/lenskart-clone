import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStore,cartQuantity} from './shopping.js';
test('saved state deduplicates products and ignores malformed quantities',()=>{
  assert.deepEqual(normalizeStore(['a','a',null],[null,{id:'a',quantity:2},{id:'a',quantity:3},{id:'b',quantity:-1}]),{favorites:['a'],cart:[{id:'a',quantity:3}]});
});
test('cart adding, updating, and removing preserve other products',()=>{
  const original=[{id:'a',quantity:2}];
  const added=cartQuantity(original,'b',1,10);
  assert.deepEqual(cartQuantity(added,'b',2,10),[{id:'a',quantity:2},{id:'b',quantity:2}]);
  assert.deepEqual(cartQuantity(added,'b',0,10),original);
  assert.deepEqual(original,[{id:'a',quantity:2}]);
});
test('stock limits prevent increases while allowing reduction after stock changes',()=>{
  assert.throws(()=>cartQuantity([],'a',1,0),/stock/);
  assert.throws(()=>cartQuantity([{id:'a',quantity:2}],'a',3,2),/stock/);
  assert.deepEqual(cartQuantity([{id:'a',quantity:4}],'a',3,1),[{id:'a',quantity:3}]);
  assert.throws(()=>cartQuantity([],'a',1.5,10),/valid quantity/);
});

test('saved cart keeps selected product options after reloading', () => {
  const options={type:'Reading Glasses',color:'Blue',size:'L'};
  assert.deepEqual(normalizeStore([],[{id:'frame',quantity:1,options}]).cart,[{id:'frame',quantity:1,options}]);
  assert.deepEqual(normalizeStore([],[{id:'frame',quantity:1,options:{color:3}}]).cart,[{id:'frame',quantity:1}]);
});
