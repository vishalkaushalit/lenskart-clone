import test from 'node:test';
import assert from 'node:assert/strict';
import {collectionLink} from './collectionLinks.js';
const products=[{name:'Hustlr Classic',brand:'Lenskart',shape:'Cat Eye'}];
test('collection links target actual brands, names and shapes',()=>{assert.equal(collectionLink(products,{brand:'Lenskart'}),'/collection?brand=Lenskart');assert.equal(collectionLink(products,{brand:'Hustlr'}),'/collection?search=Hustlr');assert.equal(collectionLink(products,{shape:'Cat Eye'}),'/collection?shape=Cat%20Eye');});
test('missing data keeps a placeholder instead of an unavailable route',()=>{assert.equal(collectionLink([]),'#');assert.equal(collectionLink(products,{brand:'Unknown'}),'#');});
