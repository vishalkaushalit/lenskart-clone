import test from 'node:test';
import assert from 'node:assert/strict';
import User from '../models/User.js';
import {requireAuth,requireRole} from './auth.js';
const response=()=>({statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}});
test('missing sessions never reach protected data',async(t)=>{t.mock.method(User,'findById',()=>assert.fail('unexpected lookup'));for(const req of [{},{session:{}}]){const res=response();await requireAuth(req,res,()=>assert.fail('guest allowed'));assert.equal(res.statusCode,401);}});
test('deleted and inactive accounts cannot access protected routes',async(t)=>{for(const user of [null,{status:'inactive'}]){t.mock.method(User,'findById',async()=>user);const res=response();await requireAuth({session:{userId:'id'}},res,()=>assert.fail('invalid account allowed'));assert.equal(res.statusCode,user?403:401);t.mock.restoreAll();}});
test('admin role comes from the database, never a request body',async(t)=>{t.mock.method(User,'findById',async()=>({role:'customer',status:'active'}));const req={session:{userId:'id'},body:{role:'admin'}};const res=response();await requireAuth(req,res,()=>requireRole('admin')(req,res,()=>assert.fail('customer allowed')));assert.equal(res.statusCode,403);});
test('active admins can access managed routes',async(t)=>{t.mock.method(User,'findById',async()=>({role:'admin',status:'active'}));let allowed=false;const req={session:{userId:'id'}};await requireAuth(req,response(),()=>requireRole('admin')(req,response(),()=>{allowed=true;}));assert.equal(allowed,true);});
