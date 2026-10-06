import test from 'node:test';
import assert from 'node:assert/strict';
import { paginateRows } from './tablePagination.js';
test('table pages continue row numbering and show only the requested rows',()=>{
 const page=paginateRows(Array.from({length:12},(_,index)=>index+1),2,5);
 assert.deepEqual(page.rows,[6,7,8,9,10]);assert.equal(page.offset+1,6);assert.equal(page.total,12);
});
test('table pagination clamps after deletions and safely handles empty rows',()=>{
 const page=paginateRows([1,2,3,4,5],2,5);assert.equal(page.page,1);assert.equal(page.offset,0);
 assert.deepEqual(paginateRows([],99,5).rows,[]);assert.equal(paginateRows([],99,5).page,1);
});
