import ProductVariant from '../models/ProductVariant.js';
export const publicVariant = row => ({ id: String(row._id), productId: String(row.productId), size: row.size, color: row.color, price: row.price, originalPrice: row.originalPrice, stock: row.stock, images: row.images, status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt });
export async function attachVariants(products, admin = false) {
  const ids = products.filter(product => product.hasVariants).map(product => product._id);
  if (!ids.length) return products;
  const rows = await ProductVariant.find({ productId: { $in: ids }, ...(!admin ? { status: 'active' } : {}) }).sort({ createdAt: 1, _id: 1 }).lean();
  const byProduct=new Map();
  for(const row of rows) {
    const id=String(row.productId);
    let group=byProduct.get(id);
    if(!group) {
      group={variants:[],colors:new Set(),sizes:new Set(),stock:0};
      byProduct.set(id,group);
    }
    group.variants.push(publicVariant(row));
    if(row.status==='active') {
      group.colors.add(row.color);group.sizes.add(row.size);group.stock+=row.stock;
    }
  }
  return products.map(product => {
    if (!product.hasVariants) return product;
    const group=byProduct.get(String(product._id));
    // Variant records are the source of available options and inventory.
    return {...product,variants:group?.variants||[],availableColors:[...(group?.colors||[])],availableSizes:[...(group?.sizes||[])],stock:group?.stock||0};
  });
}
