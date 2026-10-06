import ProductVariant from '../models/ProductVariant.js';
export const publicVariant = row => ({ id: String(row._id), productId: String(row.productId), size: row.size, color: row.color, price: row.price, originalPrice: row.originalPrice, stock: row.stock, images: row.images, status: row.status, createdAt: row.createdAt, updatedAt: row.updatedAt });
export async function attachVariants(products, admin = false) {
  const ids = products.filter(product => product.hasVariants).map(product => product._id);
  if (!ids.length) return products;
  const rows = await ProductVariant.find({ productId: { $in: ids }, ...(!admin ? { status: 'active' } : {}) }).sort({ createdAt: 1, _id: 1 }).lean();
  return products.map(product => {
    if (!product.hasVariants) return product;
    const variants=rows.filter(row=>String(row.productId)===String(product._id));
    const active=variants.filter(row=>row.status==='active');
    // Variant records are the source of available options and inventory.
    return {...product,variants:variants.map(publicVariant),availableColors:[...new Set(active.map(row=>row.color))],availableSizes:[...new Set(active.map(row=>row.size))],stock:active.reduce((sum,row)=>sum+row.stock,0)};
  });
}
