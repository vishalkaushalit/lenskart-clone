function normalize(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function matchesSearch(product, query) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const text = normalize([
    product.name, product.brand, product.shape, product.color, product.productType,
    product.category, product.gender, product.sku, product.subtitle, product.description,
    ...(product.variants || []).flatMap(variant=>[variant.color,variant.size]), product.material, ...(product.features || []), ...(product.lensTypes || []),
  ].filter(Boolean).join(' '));
  return terms.every(term => text.includes(term));
}
