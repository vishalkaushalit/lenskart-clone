import SoldOutBadge from './SoldOutBadge';
import FrameSizeBadge from './FrameSizeBadge';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import ProductCardImage from './ProductCardImage';
import { resolveVariant } from '../state/productVariants';
import './WishlistCard.css';

export default function WishlistCard({id, product:base, assetUrl, onRemove, onSimilar}) {
  const variant=base?.variants?.find(row=>row.status==='active');
  const product=variant?resolveVariant(base,variant)||base:base;
  const target=base?`/products/${base.slug||id}`:'';
  return <article className="wishlist-product-card">
    <button type="button" className="wishlist-card-remove" onClick={onRemove} aria-label={`Remove ${base?.name||'unavailable product'} from wishlist`}><X size={18} aria-hidden="true"/></button>
    {product?<><div className="wishlist-card-photo"><SoldOutBadge product={base} overlay/><Link to={target} aria-label={`View ${base.name}`}><ProductCardImage src={assetUrl(product.image)} alt={base.name}/></Link></div>
      <div className="wishlist-card-content"><h2><Link to={target}>{base.name}</Link></h2><p className="wishlist-card-meta">{product.color} {product.color && ' · ' }<FrameSizeBadge size={product.size}/></p>
        <strong className="wishlist-card-price">₹{product.price.toLocaleString('en-IN')}</strong>
        <Link className="wishlist-card-view" to={target}>View frame</Link><button type="button" className="wishlist-card-similar" onClick={onSimilar}>View similar <ArrowRight size={16} aria-hidden="true"/></button>
      </div></>:<div className="saved-unavailable"><h2>Product unavailable</h2><p>This product is no longer available. You can remove it from your wishlist.</p></div>}
  </article>;
}
