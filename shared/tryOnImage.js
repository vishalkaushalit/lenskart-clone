const colorKey = (color) =>
  String(color || '')
    .trim()
    .toLowerCase();

export function colorTryOnImage(product, variant, variants = product.variants || []) {
  if (variant.tryOnImage) return variant.tryOnImage;
  const color = colorKey(variant.color);
  if (!color) return '';
  const sibling = variants.find(
    (row) => row.id !== variant.id && colorKey(row.color) === color && row.tryOnImage,
  );
  return sibling?.tryOnImage || (colorKey(product.color) === color ? product.tryOnImage : '') || '';
}
