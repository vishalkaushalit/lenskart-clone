import { checkoutRows } from '../state/checkout';
import CouponApplied from "../components/CouponApplied";
import CouponDiscount from "../components/CouponDiscount";
import CouponField from '../components/CouponField';
import Loader from '../components/Loader';
import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import useSavedProducts from '../hooks/useSavedProducts';
import PopupMessage from '../components/PopupMessage';
import './SavedProducts.css';
const money=value=>`₹${value.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const asset=(path)=>path?.startsWith('/')?new URL(path,import.meta.env.VITE_API_URL||'http://localhost:5001/api').href:path;
export default function Cart(){
  const {cart,appliedCoupon,cartCount,removeFromCart,changeQuantity}=useStore();const {loading,items:rawItems,error,retry}=useSavedProducts(cart.map((item)=>item.id));
  const items=checkoutRows(rawItems,cart);
  const billItems=items.filter(item=>item.product).map(({key,product,entry})=>{
    const quantity=entry.quantity;
    const price=product.price;
    const original=Math.max(price,product.originalPrice||price);
    return {id:key,name:product.name,quantity,original:original*quantity,discount:(original-price)*quantity,payable:price*quantity};
  });
  const originalTotal=billItems.reduce((sum,item)=>sum+item.original,0);
  const discountTotal=billItems.reduce((sum,item)=>sum+item.discount,0);
  const total=billItems.reduce((sum,item)=>sum+item.payable,0);
  const couponDiscount=appliedCoupon?.signature===JSON.stringify(cart)&&appliedCoupon.subtotal===total?appliedCoupon.discount:0;
  return <section className="saved-products-page"><div className="saved-page-heading"><div><h1>Cart ({cartCount} {cartCount===1?'Item':'Items'})</h1></div><Link to="/collection">Continue shopping</Link></div>
    {loading?<Loader label="Loading cart"/>:error?<div><PopupMessage message={error}/><button onClick={retry} className="saved-button">Try again</button></div>:!cart.length?<div className="saved-empty"><ShoppingBag size={44}/><h2>Your bag is empty</h2><Link to="/collection" className="saved-button">Continue shopping</Link></div>:<div className="saved-cart-layout"><div className="saved-cart-items">{items.map(({id,key,product,entry})=>{const quantity=entry?.quantity||1;return <article key={key} className="saved-cart-row">{product?<><Link to={`/products/${product.slug||id}`}><img src={asset(product.image)} alt={product.name}/></Link><div className="cart-item-info"><h2><Link to={`/products/${product.slug||id}`}>{product.name}</Link></h2><dl className="cart-item-features"><div><dt>Color:</dt><dd>{entry?.options?.color||product.color}</dd></div><div><dt>Size:</dt><dd>{entry?.options?.size||product.size}</dd></div><div><dt>Product Type:</dt><dd>{entry?.options?.type||(product.powered?'Powered Eyeglass':product.productType)}</dd></div></dl></div><div className="cart-item-price"><span className="cart-column-label">Price</span><strong>{money(product.price)}</strong></div><div className="cart-item-quantity"><span className="cart-column-label">Quantity</span>{quantity>product.stock&&<p className="saved-stock-error">Only {product.stock} available. Please adjust the quantity.</p>}<div className="saved-quantity"><button aria-label={`Decrease quantity of ${product.name}`} onClick={()=>changeQuantity(key,quantity-1,product.stock)}><Minus size={14}/></button><span>{quantity}</span><button aria-label={`Increase quantity of ${product.name}`} disabled={quantity>=product.stock} onClick={()=>changeQuantity(key,quantity+1,product.stock)}><Plus size={14}/></button></div></div></>:<div className="cart-item-info cart-item-unavailable"><h2>Product unavailable</h2><p>Please remove this item from your bag.</p></div>}<button className="delete-button saved-cart-remove" aria-label={`Remove ${product?.name||'product'} from cart`} onClick={()=>removeFromCart(key)}><Trash2 size={18} aria-hidden="true" /></button></article>;})}</div><aside className="cart-billing"><div className="cart-bill-card"><h2>Bill Details</h2><details open className="cart-bill-breakdown"><summary><span>Total item price <ChevronDown size={14}/></span><span>{money(originalTotal)}</span></summary><div className="cart-bill-lines">{billItems.map((item,index)=><div key={item.id}><span title={item.name}>Item {index+1} price{item.quantity>1&&` × ${item.quantity}`}</span><span>{money(item.original)}</span></div>)}</div></details><details open className="cart-bill-breakdown cart-bill-discount"><summary><span>Total discount <ChevronDown size={14}/></span><span className="cart-bill-saving">−{money(discountTotal)}</span></summary><div className="cart-bill-lines">{billItems.filter(item=>item.discount>0).map(item=><div key={item.id}><span>{item.name}</span><span className="cart-bill-saving">−{money(item.discount)}</span></div>)}{discountTotal===0&&<p>No discounts applied.</p>}</div></details>{couponDiscount>0&&<CouponDiscount coupon={appliedCoupon}/>}<div className="store-coupon-total"><strong>Total</strong><span className="store-coupon-total-values">{originalTotal>total-couponDiscount&&<del>{money(originalTotal)}</del>}<strong>{money(total-couponDiscount)}</strong></span></div>{couponDiscount>0&&<CouponApplied coupon={appliedCoupon}/>} {items.some(item=>!item.product)&&<p className="cart-bill-note">Unavailable products are excluded from your bill.</p>}<CouponField subtotal={total}/><Link to="/checkout" className="cart-checkout-button">Proceed To Checkout <ChevronDown size={18}/></Link></div></aside></div>}
  </section>;
}
