import FrameSizeBadge from './FrameSizeBadge';
import { useEffect, useRef } from 'react';
import { Link } from '../storeRouter';
import { X } from 'lucide-react';
import { resolveVariant } from '../state/productVariants';
export default function WishlistComparison({ products, onClose }) {
  const dialog = useRef(null);
  const frames = products.slice(0,2).map(base => {
    const variant = base.variants?.find(row=>row.status==='active');
    return variant ? resolveVariant(base,variant)||base : base;
  });
  useEffect(()=>{
    const node=dialog.current;const focus=document.activeElement;const overflow=document.body.style.overflow;
    node.showModal();document.body.style.overflow='hidden';
    return()=>{node.close();document.body.style.overflow=overflow;if(focus?.isConnected)focus.focus();};
  },[]);
  return <dialog ref={dialog} className="app-popup wishlist-comparison" aria-labelledby="wishlist-compare-title" onCancel={event=>{event.preventDefault();onClose();}}>
    <div className="wishlist-comparison-heading"><h2 id="wishlist-compare-title">Compare your frames</h2><button type="button" onClick={onClose} aria-label="Close comparison"><X size={22}/></button></div>
    <p>Comparing your first two available saved frames.</p><div className="wishlist-comparison-table"><table><thead><tr><th scope="col">Details</th>{frames.map(frame=><th scope="col" key={frame.id}>{frame.name}</th>)}</tr></thead><tbody>{['shape','size','color','material','brand','price'].map(field=><tr key={field}><th scope="row">{field}</th>{frames.map(frame=><td key={frame.id}>{field==='price'?`₹${frame.price.toLocaleString('en-IN')}`:field==='size'?<FrameSizeBadge size={frame.size}/>:frame[field]||'Not specified'}</td>)}</tr>)}<tr><th scope="row">Explore</th>{frames.map(frame=><td key={frame.id}><Link to={`/products/${frame.slug||frame.id}`} onClick={onClose}>View frame →</Link></td>)}</tr></tbody></table></div>
  </dialog>;
}
