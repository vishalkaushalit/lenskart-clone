import { Link } from 'react-router-dom';
import { PanelsTopLeft, X } from 'lucide-react';
import ProductCardImage from './ProductCardImage';
import { resolveVariant } from '../state/productVariants';
import './WishlistCard.css';

export default function WishlistCard({id, product: base, assetUrl, onRemove, onSimilar}) {
  const variant=base?.variants?.find(row=>row.status==='active');
  const product=variant?resolveVariant(base,variant)||base:base;
  const target=base?`/products/${base.slug||id}`:'';
  return <article className="wishlist-product-card">
    <button type="button" className="wishlist-card-remove" onClick={onRemove} aria-label={`Remove ${base?.name||'unavailable product'} from wishlist`}><X size={24} aria-hidden="true"/></button>
    {product?<>
      <div className="wishlist-card-photo">
        <Link to={target} aria-label={`View ${base.name}`}><ProductCardImage src={assetUrl(product.image)} alt={base.name}/></Link>
        <button type="button" className="wishlist-card-similar" onClick={onSimilar}><PanelsTopLeft size={18} aria-hidden="true"/>View Similar</button>
      </div>
      <div className="wishlist-card-content">
        <h2><Link to={target}>{base.name}</Link></h2>
        <strong className="wishlist-card-price">₹{product.price.toLocaleString('en-IN')}</strong>
        <Link className="wishlist-card-view" to={target}>View</Link>
      </div>
    </>:<div className="saved-unavailable"><h2>Product unavailable</h2><p>This product is no longer available. You can remove it from your wishlist.</p></div>}
  </article>;
}
