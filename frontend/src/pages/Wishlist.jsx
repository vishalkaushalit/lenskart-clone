import { useRef, useState } from 'react';
import useStickyColumns from '../hooks/useStickyColumns';
import SimilarProductsPopup from '../components/SimilarProductsPopup';
import Loader from '../components/Loader';
import WishlistCard from '../components/WishlistCard';
import { Link } from '../storeRouter';
import { Heart, ArrowRight } from 'lucide-react';
import WishlistComparison from '../components/WishlistComparison';
import fitFrames from '../assets/images/wishlist/fit-frames.svg';
import compareFrames from '../assets/images/wishlist/compare-frames.svg';
import { useStore } from '../context/StoreContext';
import useSavedProducts from '../hooks/useSavedProducts';
import PopupMessage from '../components/PopupMessage';
import './SavedProducts.css';
import './Wishlist.css';
const asset=(path)=>path?.startsWith('/')?new URL(path,import.meta.env.VITE_API_URL || (import.meta.env.PROD ? `${window.location.origin}/api` : 'http://localhost:5001/api')).href:path;
export default function Wishlist(){
  const cardsRef=useRef(null);
  const helpRef=useRef(null);
  const [similarProduct,setSimilarProduct]=useState(null);
  const [comparing,setComparing]=useState(false);
  const {favorites,removeFavorite}=useStore();const {loading,items,error,retry}=useSavedProducts(favorites);
  useStickyColumns(cardsRef, helpRef, !loading && !error && favorites.length > 0);
  const available=items.filter(item=>item.product).map(item=>item.product);
  return <section className="saved-products-page wishlist-page">
    <div className="wishlist-page-heading"><div><div className="wishlist-title-row"><h1>Your Wishlist</h1><span className="wishlist-saved-count">{favorites.length} saved</span></div><p>The frames you love, all in one place.</p></div></div>
    {loading?<Loader label="Loading wishlist"/>:error?<div><PopupMessage message={error}/><button className="saved-button" onClick={retry}>Try again</button></div>:!favorites.length?<div className="saved-empty"><Heart size={44}/><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here.</p><Link to="/collection" className="saved-button">Explore eyeglasses</Link></div>:<>
      <div className="wishlist-main-layout"><div ref={cardsRef} className="wishlist-items-grid">{items.map(({id,product})=><WishlistCard key={id} id={id} product={product} assetUrl={asset} onRemove={()=>removeFavorite(id)} onSimilar={()=>setSimilarProduct(product)}/>)}</div>
        <aside ref={helpRef} className="wishlist-fit-panel"><span className="wishlist-eyebrow">Need help?</span><h2>Find your perfect fit</h2><p>Explore different frame shapes, sizes and materials to find what suits you best.</p><div className="wishlist-fit-art"><img src={fitFrames} alt=""/></div><Link className="wishlist-outline-link" to="/collection">Browse frames <ArrowRight size={20} aria-hidden="true"/></Link></aside>
      </div>
    </>}
    <section className="wishlist-compare-banner"><div className="wishlist-compare-art"><img src={compareFrames} alt=""/></div><div><h2>{available.length===2?'Two favourites.':'Your favourites.'} One great look.</h2><p>Compare frame shape, size and material to find your match.</p>{available.length<2&&<p className="wishlist-compare-hint">Save at least two frames to compare them.</p>}</div><button type="button" className="wishlist-outline-link" disabled={available.length<2} onClick={()=>setComparing(true)}>Compare frames <ArrowRight size={20} aria-hidden="true"/></button></section>

    {similarProduct&&<SimilarProductsPopup product={similarProduct} onClose={()=>setSimilarProduct(null)}/>}
    {comparing&&available.length>=2&&<WishlistComparison products={available} onClose={()=>setComparing(false)}/>}
  </section>;
}
