import test from 'node:test';
import assert from 'node:assert/strict';
import Category from '../models/Category.js';
import {adminCategories,publicCategories} from './categoryRoutes.js';
import {requireAuth} from '../middleware/auth.js';
test('category management requires authentication and an admin role',()=>{
 assert.equal(adminCategories.stack[0].handle,requireAuth);
 let status;adminCategories.stack[1].handle({user:{role:'customer'}},{status(code){status=code;return this;},json(){}},()=>assert.fail('customer allowed'));assert.equal(status,403);
});
test('public categories omit subcategories whose parent is inactive',async(t)=>{
 t.mock.method(Category,'find',()=>({sort(){return this;},async lean(){return [{_id:'root',name:'Eyeglasses',parent:null},{_id:'child',name:'Classic',parent:'root'},{_id:'hidden-child',name:'Hidden',parent:'inactive'}];}}));
 let data;await publicCategories.stack[0].route.stack[0].handle({}, {json(body){data=body;}},assert.ifError);
 assert.deepEqual(data.categories.map(row=>row._id),['root','child']);
});
test('category model rejects empty and oversized names',async()=>{
 await new Category({name:'Eyeglasses'}).validate();
 await assert.rejects(new Category({name:''}).validate());await assert.rejects(new Category({name:'x'.repeat(101)}).validate());
});
test('category slugs are generated, stable on rename and globally unique',async()=>{
 const category=new Category({name:'Kids Glasses'});await category.validate();assert.equal(category.slug,'kids-glasses');
 category.name='Children Glasses';await category.validate();assert.equal(category.slug,'kids-glasses');
 await assert.rejects(new Category({name:'Invalid',slug:'Bad Slug'}).validate());
 const index=Category.schema.indexes().find(([fields])=>fields.slug===1);assert.equal(index[0].parent,undefined);assert.equal(index[1].unique,true);
});
