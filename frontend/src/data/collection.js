export const filterGroups = {
  Price: ['Under ₹2,000', '₹2,000–₹3,000', 'Above ₹3,000'],
  Gender: ['Men', 'Women', 'Unisex'],
  'Shape & Style': ['Square', 'Rectangle', 'Round', 'Aviator', 'Cat Eye', 'Geometric', 'Clubmaster'],
  'Frame Size': ['S', 'M', 'L'],
  Brand: ['Lenskart', 'John Jacobs'],
  'Frame Color': ['Black', 'Brown', 'Grey', 'Gold', 'Pink'],
};
export function matchesFilters(product, filters) {
  return Object.entries(filters).every(([group, selected]) => !selected.length || selected.some((value) => {
    if (group === 'Price') return value === 'Under ₹2,000' ? product.price < 2000 : value === '₹2,000–₹3,000' ? product.price >= 2000 && product.price <= 3000 : product.price > 3000;
    const field = { Gender: 'gender', 'Shape & Style': 'shape', 'Frame Size': 'size', Brand: 'brand', 'Frame Color': 'color' }[group];
    return product[field] === value;
  }));
}
