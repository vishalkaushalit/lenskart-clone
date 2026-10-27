import test from 'node:test';
import assert from 'node:assert/strict';
import { pageNoindex, sitemapPages } from './indexing.js';
test('indexing uses saved booleans including false, otherwise defaults',()=>{
 assert.equal(pageNoindex(null,true),true);
 assert.equal(pageNoindex(false,true),false);
 assert.equal(pageNoindex(true,false),true);
});
test('automatic sitemap follows effective page indexing settings',()=>{
 const pages=[{path:'/',noindex:false},{path:'/collection',noindex:false},{path:'/wishlist',noindex:true}];
 assert.deepEqual(sitemapPages(pages,[{path:'/collection',noindex:true},{path:'/wishlist',noindex:false}]).map(row=>row.path),['/','/wishlist']);
});

test('sitemap uses the current page URL instead of a redirected original',()=>{
 assert.deepEqual(sitemapPages([{path:'/wishlist',noindex:true}],[{path:'/wishlist',urlPath:'/favorites',noindex:false}]).map(row=>row.path),['/favorites']);
});
