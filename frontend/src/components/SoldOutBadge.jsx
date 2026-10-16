import './SoldOutBadge.css';
export default function SoldOutBadge({ product, overlay = false }) {
  if (!product) return null;
  const variants = product.hasVariants && product.variants?.filter(variant => variant.status === 'active');
  const stock = variants?.length ? variants.reduce((sum, variant) => sum + (Number(variant.stock) || 0), 0) : product.stock;
  if (!Number.isFinite(stock) || stock > 0) return null;
  return <span className={`sold-out-badge${overlay ? ' sold-out-badge-overlay' : ''}`}>Sold out</span>;
}
