import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, PanelsTopLeft, BadgePercent } from 'lucide-react';
import ProductGallery from './ProductGallery';
import { resolveVariant } from '../state/productVariants';
const money = new Intl.NumberFormat('en-IN');
const swatches = {black:'#242424',brown:'#594744',grey:'#9ca3af',gray:'#9ca3af',gold:'#c5ae77',pink:'#ba4055',red:'#a82d43',blue:'#536c99',green:'#5d8972',silver:'#adb3bb',white:'#e0e0e0',transparent:'#d9e5e9'};
export default function ProductCard({ product: base, assetUrl, favorite, onFavorite, onSimilar }) {
  const variants = base.variants || [];
  const colors = [...new Set(base.hasVariants ? variants.map(row=>row.color) : [base.color,...(base.availableColors||[])])].filter(Boolean);
  const [selectedColor,setSelectedColor] = useState(colors[0]);
  const color = colors.includes(selectedColor) ? selectedColor : colors[0];
  const variant = variants.find(row=>row.color===color);
  const product = base.hasVariants ? resolveVariant(base,{color,size:variant?.size}) || base : base;
  const target = `/products/${base.slug||base.id}`;
  const discount = product.originalPrice>product.price ? Math.round((1-product.price/product.originalPrice)*100) : 0;
  return <article className="collection-card reference-product-card">
    <div className="collection-product-image">
      {base.rating>0&&<span className="collection-rating"><Star size={13} fill="currentColor"/>{base.rating}</span>}
      <button className="collection-heart" aria-label={`${favorite?'Remove':'Add'} ${base.name} ${favorite?'from':'to'} wishlist`} aria-pressed={favorite} onClick={onFavorite}><Heart size={24} fill={favorite?'currentColor':'none'}/></button>
      <ProductGallery key={color} product={product} assetUrl={assetUrl} linkTo={target} dots/>
      <div className="collection-image-tools"><button className="collection-similar" onClick={onSimilar}><PanelsTopLeft size={16}/>View Similar</button><div className="collection-swatches">{colors.slice(0,2).map(value=><button key={value} title={value} aria-label={`Select ${value} for ${base.name}`} aria-pressed={value===color} className={value===color?'chosen':''} style={{'--swatch':swatches[value.toLowerCase()]||'#73739d'}} onClick={()=>setSelectedColor(value)}/>)}{colors.length>2&&<Link to={target} title="View all colors">+{colors.length-2}</Link>}</div></div>
    </div>
    <div className="collection-product-info"><h2><Link to={target}>{product.name}</Link></h2><span className="collection-size"><b>{product.size}</b>Size</span><p className="collection-price"><strong>₹{money.format(product.price)}</strong> with Free BLU lenses</p>{discount>0&&<p className="collection-discount"><del>₹{money.format(product.originalPrice)}</del> <span>({discount}% OFF)</span></p>}</div>
    <div className="collection-offer"><BadgePercent size={17} fill="currentColor"/>Use code SINGLE for this price</div>
  </article>;
}
