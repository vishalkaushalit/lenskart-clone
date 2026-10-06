import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import CouponDiscount from '../components/CouponDiscount';
import Loader from '../components/Loader';
import { apiRequest } from '../api/api';
import './Checkout.css';
const money=value=>`₹${value.toLocaleString('en-IN',{maximumFractionDigits:2})}`;

export default function ThankYou(){
  const {id}=useParams();
  const {setHideNavigation}=useOutletContext();
  const [result,setResult]=useState(null);
  const [attempt,setAttempt]=useState(0);
  useEffect(()=>{setHideNavigation(true);return()=>setHideNavigation(false);},[setHideNavigation]);
  useEffect(()=>{
    const controller=new AbortController();
    apiRequest(`/orders/${encodeURIComponent(id)}`,{signal:controller.signal})
      .then(data=>{if(!controller.signal.aborted)setResult({id,order:data.order});})
      .catch(error=>{if(!controller.signal.aborted)setResult({id,error:error.message});});
    return()=>controller.abort();
  },[id,attempt]);
  if(!result||result.id!==id)return <Loader label="Loading your order"/>;
  if(result.error)return <section className="order-success-page"><div className="order-success-card"><h1>Unable to load your order</h1><p className="order-success-note" role="alert">{result.error}</p><div className="order-success-actions"><button className="saved-button" onClick={()=>{setResult(null);setAttempt(value=>value+1);}}>Try again</button><Link to="/profile?tab=orders">View my orders</Link></div></div></section>;
  const {order}=result;
  return <section className="order-success-page">
    <div className="order-success-confetti" aria-hidden="true">{Array.from({length:48},(_,index)=><span key={index} style={{'--confetti-x':`${(index*37)%100}%`,'--confetti-delay':`${(index%8)*.12}s`,'--confetti-duration':`${2.6+(index%5)*.25}s`,'--confetti-drift':`${((index*29)%180)-90}px`,'--confetti-color':['#2563eb','#00b894','#f5b942','#ed7aa8','#8b5cf6'][index%5]}}/>)}</div>
    <div className="order-success-card">
    <div className="order-success-icon"><Check size={32} aria-hidden="true"/></div>
    <h1>Your order has been placed successfully</h1>
    <p className="order-success-note">Thank you for shopping with us.</p>
    <section className="order-success-summary" aria-label="Order summary">
      <h2>Order summary <span>#{order.orderId??'—'}</span></h2>
      <ul>{order.items.map((item,index)=><li key={item._id||index}><div><strong>{item.name}</strong><p>{[item.options?.color&&`Color: ${item.options.color}`,item.options?.size&&`Size: ${item.options.size}`,`Quantity: ${item.quantity}`].filter(Boolean).join(' · ')}</p></div><span>{money(item.unitPrice*item.quantity)}</span></li>)}</ul>
      <dl><div><dt>Payment</dt><dd>{order.paymentMethod==='online'?'Pay Online':'Cash on Delivery'}</dd></div>{order.discount>0&&<CouponDiscount coupon={{code:order.couponCode,discount:order.discount}} definitionList/>}<div className="order-success-total"><dt>Total</dt><dd>{money(order.totalAmount)}</dd></div></dl>
    </section>
    <div className="order-success-actions"><Link className="saved-button" to={`/profile?tab=orders#order-${order._id}`}>View my order</Link><Link className="order-success-home" to="/">Back to home</Link></div>
  </div></section>;
}
