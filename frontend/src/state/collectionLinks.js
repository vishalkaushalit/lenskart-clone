export function collectionLink(products,{brand,search,shape}={}){
 if(!products?.length)return '#';
 const matches=value=>String(value||'').toLowerCase();
 if(brand){if(products.some(product=>matches(product.brand)===matches(brand)))return `/collection?brand=${encodeURIComponent(brand)}`;search=brand;}
 if(shape&&products.some(product=>matches(product.shape)===matches(shape)))return `/collection?shape=${encodeURIComponent(shape)}`;
 if(search&&products.some(product=>matches(product.name).includes(matches(search))))return `/collection?search=${encodeURIComponent(search)}`;
 return brand||search||shape?'#':'/collection';
}
