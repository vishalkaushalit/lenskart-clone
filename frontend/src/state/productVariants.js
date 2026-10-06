// Resolve the selected size/color into the variant price, inventory and gallery.
export function resolveVariant(product, options = {}, variantId) {
  if (!product || !product.hasVariants) return product;
  const variant = (product.variants || []).find(row => row.status === 'active' && row.size === options.size && row.color.toLowerCase() === String(options.color || '').toLowerCase());
  if (!variant || variantId && variant.id !== variantId) return null;
  const price = variant.price ?? product.price;
  const images = variant.images.length ? variant.images : product.images;
  return { ...product, variantId: variant.id, price, originalPrice: Math.max(variant.originalPrice ?? product.originalPrice ?? price, price), stock: variant.stock, color: variant.color, size: variant.size, images, image: images?.[0] || product.image };
}
