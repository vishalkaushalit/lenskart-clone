import test from 'node:test';
import assert from 'node:assert/strict';
import { creationDate } from './date.js';
test('creation dates use India calendar dates and tolerate missing legacy values',()=>{
 assert.match(creationDate('2026-10-06T20:00:00Z'),/07/);
 assert.equal(creationDate(null),'—');
 assert.equal(creationDate('invalid'),'—');
});
