import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import useSavedProducts from '../hooks/useSavedProducts';
import PopupMessage from '../components/PopupMessage';
import './SavedProducts.css';
const asset=(path)=>path?.startsWith('/')?new URL(path,import.meta.env.VITE_API_URL||'http://localhost:5001/api').href:path;
export default function Wishlist(){
  const {favorites,removeFavorite,addToCart}=useStore();const {loading,items,error,retry}=useSavedProducts(favorites);
  return <section className="saved-products-page"><div className="saved-page-heading"><div><h1>My wishlist</h1><p>{favorites.length} saved {favorites.length===1?'product':'products'}</p></div><Link to="/collection">Continue shopping</Link></div>
    {loading?<Loader label="Loading wishlist"/>:error?<div><PopupMessage message={error}/><button className="saved-button" onClick={retry}>Try again</button></div>:!favorites.length?<div className="saved-empty"><Heart size={44}/><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here.</p><Link to="/collection" className="saved-button">Explore eyeglasses</Link></div>:<div className="saved-items-grid">{items.map(({id,product})=><article className="saved-card" key={id}><button onClick={()=>removeFavorite(id)} className="saved-remove" aria-label={`Remove ${product?.name||'unavailable product'} from wishlist`}><Trash2 size={18}/></button>{product?<><Link to={`/products/${id}`}><img src={asset(product.image)} alt={product.name}/></Link><div className="saved-card-info"><p>{product.brand}</p><h2><Link to={`/products/${id}`}>{product.name}</Link></h2><strong>₹{product.price.toLocaleString('en-IN')}</strong><span className="saved-product-meta">{product.color} · Size {product.size}</span><button disabled={product.stock<1} onClick={()=>addToCart(product)} className="saved-button"><ShoppingBag size={16}/>{product.stock>0?'Add to cart':'Out of stock'}</button></div></>:<div className="saved-unavailable"><h2>Product unavailable</h2><p>This product is no longer available. You can remove it from your wishlist.</p></div>}</article>)}</div>}
  </section>;
}
