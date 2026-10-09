import './ProductPopup.css';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Ruler, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/api';
import { useStore } from '../context/StoreContext';
import ProductCardImage from './ProductCardImage';
import { resolveVariant } from '../state/productVariants';
import './SimilarProductsPopup.css';
const assetUrl=path=>path?.startsWith('/')?new URL(path,import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api')).href:path;
function SimilarPopupCard({product:base,favorite,onFavorite}){
  const variant=base.variants?.find(row=>row.status==='active');
  const product=variant?resolveVariant(base,variant)||base:base;
  const target=`/products/${base.slug||base.id}`;
  const lensText=base.productType==='Sunglasses'?'with UV protection':'with Free BLU lenses';
  const discount=product.originalPrice>product.price?Math.round((1-product.price/product.originalPrice)*100):0;
  const money=value=>`₹${value.toLocaleString('en-IN')}`;
  return <article className="similar-popup-card">
    <Link className="similar-popup-photo" to={target} aria-label={`View ${base.name}`}><ProductCardImage src={assetUrl(product.image)} alt={base.name}/></Link>
    <div className="similar-popup-details">
      <h3><Link to={target}>{base.name}</Link></h3>
      {product.size&&<span className="similar-popup-size"><Ruler size={18} aria-hidden="true"/>{product.size}</span>}
      <p className="similar-popup-price"><strong>{money(product.price)}</strong> {lensText}</p>
      {discount>0&&<p className="similar-popup-discount"><del>{money(product.originalPrice)}</del> <span>({discount}% OFF)</span></p>}
      <div className="similar-popup-buy-row"><Link to={target} className="similar-popup-buy">Buy</Link></div>
    </div>
    <button type="button" className="similar-popup-heart" aria-label={`${favorite?'Remove':'Add'} ${base.name} ${favorite?'from':'to'} wishlist`} aria-pressed={favorite} onClick={onFavorite}><Heart size={24} fill={favorite?'currentColor':'none'}/></button>
  </article>;
}
export default function SimilarProductsPopup({product,onClose}){
  const dialogRef=useRef(null);
  const {favorites,toggleFavorite}=useStore();
  const [result,setResult]=useState({loading:true,products:[],error:''});
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{
    const dialog=dialogRef.current;
    const previousFocus=document.activeElement;
    const overflow=document.body.style.overflow;
    dialog.showModal();document.body.style.overflow='hidden';
    return()=>{dialog.close();document.body.style.overflow=overflow;if(previousFocus?.isConnected)previousFocus.focus();};
  },[]);
  useEffect(()=>{
    const controller=new AbortController();
    apiRequest('/products?all=1',{signal:controller.signal}).then(data=>{
      const matches=data.products.filter(item=>item.id!==product.id&&item.productType===product.productType&&(!product.shape||item.shape?.toLowerCase()===product.shape.toLowerCase()));
      if(!controller.signal.aborted)setResult({loading:false,products:matches,error:''});
    }).catch(error=>{if(!controller.signal.aborted)setResult({loading:false,products:[],error:error.message});});
    return()=>controller.abort();
  },[product,attempt]);
  return createPortal(<dialog ref={dialogRef} className="product-popup similar-products-popup" aria-labelledby="similar-popup-title" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{
    if(event.target!==event.currentTarget)return;
    const bounds=event.currentTarget.getBoundingClientRect();
    if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)onClose();
  }}>
    <div className="similar-popup-heading"><h2 id="similar-popup-title">Showing Similar Items</h2><button type="button" autoFocus onClick={onClose} aria-label="Close similar products"><X size={24}/></button></div>
    <div className="similar-popup-body">
      {result.loading?<p role="status">Loading similar products…</p>:result.error?<div><p role="alert">{result.error}</p><button type="button" onClick={()=>{setResult({loading:true,products:[],error:''});setAttempt(value=>value+1);}}>Try again</button></div>:!result.products.length?<p>No similar products found.</p>:<div className="similar-popup-grid">{result.products.map(item=><SimilarPopupCard key={item.id} product={item} favorite={favorites.includes(item.id)} onFavorite={()=>toggleFavorite(item)}/>)}</div>}
    </div>
  </dialog>,document.body);
}
