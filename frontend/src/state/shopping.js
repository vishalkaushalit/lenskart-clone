export function normalizeStore(favorites, cart){
  const saved=Array.isArray(favorites)?favorites.filter((id)=>typeof id==='string'&&id.length>0):[];
  const items=new Map();
  for(const item of Array.isArray(cart)?cart:[]){
    if(item&&typeof item.id==='string'&&item.id&&Number.isSafeInteger(item.quantity)&&item.quantity>0)items.set(item.id,{id:item.id,quantity:item.quantity,...(item.options&&['type','color','size'].every(key=>typeof item.options[key]==='string'&&item.options[key].length<=100)?{options:{type:item.options.type,color:item.options.color,size:item.options.size}}:{})});
  }
  return {favorites:[...new Set(saved)],cart:[...items.values()]};
}
export function cartQuantity(cart,id,quantity,stock){
  if(!Number.isSafeInteger(quantity)||quantity<0)throw new Error('Choose a valid quantity.');
  const current=cart.find((item)=>item.id===id)?.quantity||0;
  if(quantity>stock&&quantity>=current)throw new Error('Not enough stock available.');
  if(quantity===0)return cart.filter((item)=>item.id!==id);
  return current?cart.map((item)=>item.id===id?{...item,quantity}:item):[...cart,{id,quantity}];
}
