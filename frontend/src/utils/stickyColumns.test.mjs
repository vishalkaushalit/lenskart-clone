import test from 'node:test';
import assert from 'node:assert/strict';
import { stickyColumnTop } from './stickyColumns.js';
test('short columns stick below the header while tall columns scroll to their bottom',()=>{
 assert.equal(stickyColumnTop(90,900,400),106);
 assert.equal(stickyColumnTop(90,900,1200),-316);
 assert.equal(stickyColumnTop(90,900,800),84);
 assert.equal(stickyColumnTop(120,1100,400),136);
});
