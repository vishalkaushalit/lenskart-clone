import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveVariant } from './productVariants.js';
import { checkoutRows } from './checkout.js';
import { normalizeStore,cartQuantity,cartKey } from './shopping.js';
const product={id:'frame',hasVariants:true,price:1500,originalPrice:2000,stock:99,image:'base.jpg',images:['base.jpg'],variants:[{id:'123456789012345678901234',status:'active',size:'M',color:'Black',price:1800,stock:2,images:['black.jpg']},{id:'123456789012345678901235',status:'active',size:'L',color:'Blue',price:null,stock:3,images:[]}]};
test('selection resolves variant price, gallery and stock with parent fallbacks',()=>{
 const black=resolveVariant(product,{size:'M',color:'black'});assert.equal(black.price,1800);assert.equal(black.image,'black.jpg');assert.equal(black.stock,2);
 const blue=resolveVariant(product,{size:'L',color:'Blue'});assert.equal(blue.price,1500);assert.equal(blue.image,'base.jpg');
 assert.equal(resolveVariant(product,{size:'L',color:'Black'}),null);
 const legacy={...product,hasVariants:false};assert.equal(resolveVariant(legacy),legacy);
});
test('variant cart entries survive reload and quantities change independently',()=>{
 const rows=product.variants.map(variant=>({id:product.id,variantId:variant.id,quantity:1,options:{type:'Zero Power',size:variant.size,color:variant.color}}));
 const cart=normalizeStore([],rows).cart;assert.equal(cart.length,2);
 const changed=cartQuantity(cart,cartKey(cart[0]),2,2);assert.equal(changed[0].quantity,2);assert.equal(changed[1].quantity,1);
 assert.equal(cartQuantity(changed,cartKey(cart[0]),0,2).length,1);
 const checkout=checkoutRows([{id:'frame',product}],cart);assert.equal(checkout.length,2);assert.equal(checkout[0].product.image,'black.jpg');assert.equal(checkout[1].product.price,1500);
});

test('variant comparison prices override parent pricing and legacy variants inherit it',()=>{
 const options={size:'M',color:'Black'};
 assert.equal(resolveVariant(product,options).originalPrice,2000);
 const updated={...product,variants:product.variants.map(row=>({...row,originalPrice:2500}))};
 assert.equal(resolveVariant(updated,options).originalPrice,2500);
 assert.equal(resolveVariant({...updated,variants:updated.variants.map(row=>({...row,originalPrice:1000}))},options).originalPrice,1800);
});
