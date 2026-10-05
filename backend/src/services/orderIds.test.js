import test from 'node:test';
import assert from 'node:assert/strict';
import Counter from '../models/Counter.js';
import {nextOrderId,initializeOrderIds} from './orderIds.js';
test('order IDs allocate atomically within the order transaction',async(t)=>{const session={};t.mock.method(Counter,'findOneAndUpdate',async(filter,update,options)=>{assert.equal(filter._id,'orders.orderId');assert.deepEqual(update,{$inc:{value:1}});assert.equal(options.session,session);return {value:1};});assert.equal(await nextOrderId(session),1);});
test('backfill preserves existing order numbers in dry run',async()=>{const orders={find(){return {sort(){return [{_id:'a',orderId:1},{_id:'b'}];}}}};const result=await initializeOrderIds(orders,{dryRun:true});assert.equal(result.highestExistingId,1);assert.equal(result.ordersWithoutId,1);});
