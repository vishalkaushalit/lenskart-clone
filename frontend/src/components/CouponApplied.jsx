import { X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './CouponField.css';

export default function CouponApplied({ coupon }) {
  const { setAppliedCoupon, setCouponCode, notify } = useStore();
  return <div className="store-coupon-applied-row"><span>Coupon applied:</span><button type="button" className="store-coupon-chip" aria-label={`Remove coupon ${coupon.code}`} onClick={() => { setAppliedCoupon(null); setCouponCode(''); notify('Coupon removed.'); }}><span>{coupon.code}</span><X size={19} aria-hidden="true" /></button></div>;
}
