import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
export default function StoreIcon({type}){
  const {favorites,cartCount}=useStore();const wishlist=type==='wishlist';const count=wishlist?favorites.length:cartCount;const Icon=wishlist?Heart:ShoppingBag;
  return <Link to={wishlist?'/wishlist':'/cart'} className="store-header-icon" aria-label={`${wishlist?'Wishlist':'Cart'}, ${count} ${wishlist?'products':'items'}`}><Icon size={24} strokeWidth={1.8}/>{count>0&&<span className="store-header-count" aria-hidden="true">{count>99?'99+':count}</span>}</Link>;
}
