import square from '../assets/images/eyeglasses/square.webp';
import rectangle from '../assets/images/eyeglasses/rectangle.webp';
import aviator from '../assets/images/eyeglasses/aviator.webp';
import cateye from '../assets/images/eyeglasses/cateye.webp';
import round from '../assets/images/eyeglasses/round.webp';
import geometric from '../assets/images/eyeglasses/geometric.webp';
import clubmaster from '../assets/images/eyeglasses/clubmaster.webp';

// Preview catalog until a storefront products API is available.
export const collectionProducts = [
  ['Lenskart Hustlr Classic', square, 'Square', 'Lenskart', 1500, 'Classic', 'Black', 'M', 'Unisex'],
  ['Lenskart Air POP', rectangle, 'Rectangle', 'Lenskart', 1500, 'Classic', 'Black', 'M', 'Unisex'],
  ['John Jacobs Icons Slim', geometric, 'Geometric', 'John Jacobs', 3000, 'Premium', 'Grey', 'M', 'Unisex'],
  ['Lenskart Air Round', round, 'Round', 'Lenskart', 1500, 'Classic', 'Gold', 'S', 'Women'],
  ['John Jacobs Aviator', aviator, 'Aviator', 'John Jacobs', 3000, 'Premium', 'Gold', 'L', 'Men'],
  ['Lenskart Cat Eye', cateye, 'Cat Eye', 'Lenskart', 1800, 'Classic', 'Pink', 'S', 'Women'],
  ['John Jacobs Clubmaster', clubmaster, 'Clubmaster', 'John Jacobs', 3000, 'Premium', 'Black', 'L', 'Men'],
  ['Lenskart Everyday Square', square, 'Square', 'Lenskart', 1200, 'Classic', 'Brown', 'M', 'Unisex'],
  ['John Jacobs Modern Round', round, 'Round', 'John Jacobs', 3600, 'Premium', 'Grey', 'M', 'Unisex'],
].map(([name, image, shape, brand, price, category, color, size, gender], index) => ({
  id: `frame-${index + 1}`, name, image, shape, brand, price, category, color, size, gender,
  sales: [540, 810, 390, 650, 280, 460, 320, 720, 180][index], addedAt: Date.UTC(2026, 8, index + 1),
  originalPrice: Math.round(price / .75), rating: 4.8, powered: index === 0,
}));
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
