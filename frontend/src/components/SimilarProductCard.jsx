import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import ProductCardImage from './ProductCardImage';
import { resolveVariant } from '../state/productVariants';

const currency = new Intl.NumberFormat('en-IN');
export default function SimilarProductCard({ product: base, assetUrl, favorite, onFavorite }) {
  const variant=base.variants?.find(row=>row.status==='active');
  const product=variant?resolveVariant(base,variant)||base:base;
  const target=`/products/${base.slug||base.id}`;
  const lensText=base.productType==='Sunglasses'?'with UV protection':'with Free BLU lenses';
  const discount=product.originalPrice>product.price?Math.round((1-product.price/product.originalPrice)*100):0;
  return <article className="detail-similar-card">
    <div className="detail-similar-photo">
      <Link to={target}><ProductCardImage src={assetUrl(product.image)} alt={base.name}/></Link>
      <button type="button" aria-label={`${favorite?'Remove':'Add'} ${base.name} ${favorite?'from':'to'} wishlist`} aria-pressed={favorite} onClick={onFavorite}><Heart size={22} fill={favorite?'currentColor':'none'}/></button>
    </div>
    <div className="detail-similar-content">
      <h3><Link to={target}>{base.name}</Link></h3>
      <p>{lensText}</p>
      <div className="detail-similar-price"><div><strong>₹{currency.format(product.price)}</strong> {lensText}</div>{discount>0&&<p><del>₹{currency.format(product.originalPrice)}</del> <span>({discount}% OFF)</span></p>}</div>
      <Link className="detail-similar-view" to={target}>View</Link>
    </div>
  </article>;
}
