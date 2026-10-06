import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { CircleCheck, CircleAlert, X } from 'lucide-react';
import { normalizeStore, cartQuantity, cartKey } from '../state/shopping';
import { StoreContext } from './StoreContext';
function read(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value:[];}catch{return [];}}
function initial(){return normalizeStore(read('collection-favorites'),read('store-cart'));}
function Toast({toast,onDismiss}){
  const [closing,setClosing]=useState(false);
  useEffect(()=>{const timer=setTimeout(()=>setClosing(true),1000);return()=>clearTimeout(timer);},[toast.id]);
  useEffect(()=>{if(!closing)return;const timer=setTimeout(()=>onDismiss(toast.id),260);return()=>clearTimeout(timer);},[closing,toast.id,onDismiss]);
  const Icon=toast.type==='error'?CircleAlert:CircleCheck;
  return <div className={`store-toast ${toast.type==='error'?'is-error':''} ${closing?'is-leaving':''}`} role={toast.type==='error'?'alert':'status'}><Icon size={20}/><p>{toast.message}</p><button type="button" aria-label="Dismiss notification" onClick={()=>setClosing(true)}><X size={16}/></button></div>;
}
function ToastStack({toasts,onDismiss}){
  const stack=useRef(null);
  useLayoutEffect(()=>{
    function position(){
      const header=document.querySelector('header');
      const bottom=Math.max(0,header?.getBoundingClientRect().bottom||0);
      stack.current?.style.setProperty('--toast-header-bottom',`${bottom}px`);
    }
    position();
    const observer=new ResizeObserver(position);
    const header=document.querySelector('header');
    if(header)observer.observe(header);
    window.addEventListener('resize',position);
    window.addEventListener('scroll',position,{passive:true});
    return()=>{observer.disconnect();window.removeEventListener('resize',position);window.removeEventListener('scroll',position);};
  },[toasts.length]);
  return <div ref={stack} className="store-toast-stack" aria-label="Notifications">{toasts.map(toast=><Toast key={toast.id} toast={toast} onDismiss={onDismiss}/>)}</div>;
}
export default function StoreProvider({children}){
  const [appliedCoupon,setAppliedCoupon]=useState(null);
  const [couponCode,updateCouponCode]=useState(()=>{try{return sessionStorage.getItem('store-coupon-code')||'';}catch{return '';}});
  function setCouponCode(code){updateCouponCode(code);try{sessionStorage.setItem('store-coupon-code',code);}catch{/* Retain the code for the current page session. */}}
  const [store,setStore]=useState(initial);const current=useRef(store);
  const [toasts,setToasts]=useState([]);const sequence=useRef(0);
  const notify=useCallback((message,type='success',onDismiss)=>{
    const id=++sequence.current;setToasts((previous)=>[...previous,{id,message,type,onDismiss}].slice(-4));
  },[]);
  const callbacks=useRef(new Map());
  useEffect(()=>{for(const toast of toasts)if(toast.onDismiss)callbacks.current.set(toast.id,toast.onDismiss);},[toasts]);
  const dismiss=useCallback((id)=>{setToasts((previous)=>previous.filter((toast)=>toast.id!==id));const callback=callbacks.current.get(id);callbacks.current.delete(id);callback?.();},[]);
  function commit(next){current.current=next;setStore(next);try{localStorage.setItem('collection-favorites',JSON.stringify(next.favorites));localStorage.setItem('store-cart',JSON.stringify(next.cart));}catch{notify('Changes are saved for this session only.','error');}}
  useEffect(()=>{function sync(event){if(['collection-favorites','store-cart'].includes(event.key)){const next=initial();current.current=next;setStore(next);}}window.addEventListener('storage',sync);return()=>window.removeEventListener('storage',sync);},[]);
  function toggleFavorite(product){const id=typeof product==='string'?product:product.id;const saved=current.current.favorites.includes(id);commit({...current.current,favorites:saved?current.current.favorites.filter((value)=>value!==id):[...current.current.favorites,id]});notify(saved?'Removed from wishlist.':'Added to wishlist.');}
  function removeFavorite(id){if(current.current.favorites.includes(id))toggleFavorite(id);}
  function addToCart(product, options){
    if(product.hasVariants&&!product.variantId){notify('Choose a size and color on the product page.','error');return;}
    const key=cartKey(product);
    const existing=current.current.cart.find((item)=>cartKey(item)===key);const quantity=(existing?.quantity||0)+1;
    const selection = options || {type:product.powered?'Powered Eyeglass':product.productType==='Sunglasses'?'Sunglass':'Zero Power',color:product.color,size:product.size};
    if (existing?.options && JSON.stringify(existing.options)!==JSON.stringify(selection)) {notify('Remove the existing frame from your bag before adding a different selection.','error');return;}
    try{const cart=cartQuantity(current.current.cart,key,quantity,product.stock,product.variantId).map(item=>cartKey(item)===key?{...item,options:selection}:item);commit({...current.current,cart});notify('Added to cart.');}catch(error){notify(error.message,'error');}
  }
  function removeFromCart(id){commit({...current.current,cart:current.current.cart.filter((item)=>cartKey(item)!==id)});notify('Removed from cart.');}
  function changeQuantity(id,quantity,stock){if(quantity<1){removeFromCart(id);return;}try{const cart=cartQuantity(current.current.cart,id,quantity,stock);commit({...current.current,cart});notify('Cart quantity updated.');}catch(error){notify(error.message,'error');}}
  return <StoreContext.Provider value={{...store,couponCode,setCouponCode,appliedCoupon,setAppliedCoupon,clearCart:()=>{commit({...current.current,cart:[]});setAppliedCoupon(null);setCouponCode('');},cartCount:store.cart.reduce((total,item)=>total+item.quantity,0),notify,toggleFavorite,removeFavorite,addToCart,removeFromCart,changeQuantity}}>{children}{toasts.length>0&&<ToastStack toasts={toasts} onDismiss={dismiss}/>}</StoreContext.Provider>;
}
