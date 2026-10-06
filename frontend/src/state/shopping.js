export const cartKey = item => item.variantId ? `${item.id}:${item.variantId}` : item.id;
export function normalizeStore(favorites, cart){
  const saved=Array.isArray(favorites)?favorites.filter((id)=>typeof id==='string'&&id.length>0):[];
  const items=new Map();
  for(const item of Array.isArray(cart)?cart:[]){
    if(item&&typeof item.id==='string'&&item.id&&Number.isSafeInteger(item.quantity)&&item.quantity>0)items.set(cartKey(item),{id:item.id,...(typeof item.variantId==='string'&&/^[a-f\d]{24}$/i.test(item.variantId)?{variantId:item.variantId}:{}),quantity:item.quantity,...(item.options&&['type','color','size'].every(key=>typeof item.options[key]==='string'&&item.options[key].length<=100)?{options:{type:item.options.type,color:item.options.color,size:item.options.size}}:{})});
  }
  return {favorites:[...new Set(saved)],cart:[...items.values()]};
}
export function cartQuantity(cart,id,quantity,stock,variantId){
  if(!Number.isSafeInteger(quantity)||quantity<0)throw new Error('Choose a valid quantity.');
  const current=cart.find((item)=>cartKey(item)===id)?.quantity||0;
  if(quantity>stock&&quantity>=current)throw new Error('Not enough stock available.');
  if(quantity===0)return cart.filter((item)=>cartKey(item)!==id);
  return current?cart.map((item)=>cartKey(item)===id?{...item,quantity}:item):[...cart,{id:variantId?id.split(':')[0]:id,quantity,...(variantId?{variantId}:{})}];
}
