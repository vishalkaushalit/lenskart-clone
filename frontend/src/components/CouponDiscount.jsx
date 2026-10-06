import { Tag } from 'lucide-react';
import './CouponField.css';

export default function CouponDiscount({ coupon, definitionList = false }) {
  const Label = definitionList ? 'dt' : 'span';
  const Amount = definitionList ? 'dd' : 'span';
  return <div className="store-coupon-discount">
    <Label className="store-coupon-discount-label"><Tag size={20} aria-hidden="true" /><span>{coupon.code}{coupon.percentage != null && ` −${coupon.percentage}%`}</span></Label>
    <Amount className="store-coupon-discount-amount">−₹{Number(coupon.discount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Amount>
  </div>;
}
