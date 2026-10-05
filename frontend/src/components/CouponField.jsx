import { useId } from 'react';
import { TicketPercent } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './CouponField.css';
export default function CouponField() {
  const id=useId();
  const {couponCode,setCouponCode,notify}=useStore();
  function apply(event){
    event.preventDefault();
    const code=couponCode.trim().toUpperCase();
    if(!code){notify('Enter a coupon code.','error');return;}
    if(!/^[A-Z0-9_-]{2,40}$/.test(code)){notify('Enter a valid coupon code.','error');return;}
    setCouponCode(code);
    notify('Coupon offers are not available yet. Your total has not changed.','error');
  }
  return <section className="store-coupon"><label htmlFor={id}><TicketPercent size={18}/>Apply coupon</label><form onSubmit={apply}><input id={id} value={couponCode} onChange={event=>setCouponCode(event.target.value.toUpperCase())} maxLength={40} placeholder="Enter coupon code" autoComplete="off" spellCheck={false}/><button type="submit">Apply</button></form><p>Coupon discounts will be available once offers are configured.</p></section>;
}
