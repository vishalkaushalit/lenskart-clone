import { useState } from 'react';
import SimilarProductsPopup from '../components/SimilarProductsPopup';
import Loader from '../components/Loader';
import WishlistCard from '../components/WishlistCard';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import useSavedProducts from '../hooks/useSavedProducts';
import PopupMessage from '../components/PopupMessage';
import './SavedProducts.css';
import './Wishlist.css';
const asset=(path)=>path?.startsWith('/')?new URL(path,import.meta.env.VITE_API_URL||'http://localhost:5001/api').href:path;
export default function Wishlist(){
  const [similarProduct,setSimilarProduct]=useState(null);
  const {favorites,removeFavorite}=useStore();const {loading,items,error,retry}=useSavedProducts(favorites);
  return <section className="saved-products-page wishlist-page"><div className="saved-page-heading wishlist-page-heading"><div><h1>Your Wishlist</h1><span className="wishlist-heading-dot" aria-hidden="true"/><p>{favorites.length} {favorites.length===1?'item':'items'}</p></div></div>
    <div className="wishlist-page-content">
    {loading?<Loader label="Loading wishlist"/>:error?<div><PopupMessage message={error}/><button className="saved-button" onClick={retry}>Try again</button></div>:!favorites.length?<div className="saved-empty"><Heart size={44}/><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here.</p><Link to="/collection" className="saved-button">Explore eyeglasses</Link></div>:<div className="wishlist-items-grid">{items.map(({id,product})=><WishlistCard key={id} id={id} product={product} assetUrl={asset} onRemove={()=>removeFavorite(id)} onSimilar={()=>setSimilarProduct(product)}/>)}</div>}
    </div>
    {similarProduct&&<SimilarProductsPopup product={similarProduct} onClose={()=>setSimilarProduct(null)}/>}
  </section>;
}
