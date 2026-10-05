import { useId, useState } from 'react';
import { TicketPercent } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './CouponField.css';
import { apiRequest } from '../api/api';
export default function CouponField({subtotal}) {
  const id=useId();
  const {couponCode,setCouponCode,appliedCoupon,setAppliedCoupon,cart,notify}=useStore();
  const [busy,setBusy]=useState(false);
  const signature=JSON.stringify(cart);
  const applied=appliedCoupon?.signature===signature&&appliedCoupon.subtotal===subtotal?appliedCoupon:null;
  async function apply(event){
    event.preventDefault();
    const code=couponCode.trim().toUpperCase();
    if(!code){notify('Enter a coupon code.','error');return;}
    if(!/^[A-Z0-9_-]{2,40}$/.test(code)){notify('Enter a valid coupon code.','error');return;}
    setCouponCode(code);
    setBusy(true);
    try{const result=await apiRequest('/coupons/validate',{method:'POST',body:JSON.stringify({code,items:cart})});if(result.subtotal!==subtotal){notify('Product prices have changed. Refresh your cart.','error');return;}setAppliedCoupon({...result,signature});notify(`Coupon ${result.code} applied.`);}catch(error){notify(error.message,'error');}finally{setBusy(false);}
  }
  return <section className="store-coupon"><label htmlFor={id}><TicketPercent size={18}/>Apply coupon</label><form onSubmit={apply}><input id={id} value={couponCode} onChange={event=>setCouponCode(event.target.value.toUpperCase())} maxLength={40} placeholder="Enter coupon code" autoComplete="off" spellCheck={false}/><button type="submit" disabled={busy}>{busy?'Applying…':'Apply'}</button></form>{applied&&<div className="store-coupon-applied"><span>{applied.code} applied · Saving ₹{applied.discount.toLocaleString('en-IN')}</span><button type="button" onClick={()=>{setAppliedCoupon(null);notify('Coupon removed.');}}>Remove</button></div>}</section>;
}
