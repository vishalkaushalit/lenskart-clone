import { BadgeCheck, UserRound } from 'lucide-react';
import './ReviewCard.css';

export default function ReviewCard({ review }) {
  return <article className="customer-review-card">
    <div className="customer-review-heading">
      <UserRound size={22} aria-hidden="true" />
      <div className="customer-review-author"><div className="customer-review-name"><span>{review.name}</span>{review.verifiedPurchase && <span className="customer-review-verified"><BadgeCheck size={14} aria-hidden="true" />Verified purchase</span>}</div>
        <time dateTime={new Date(review.date).toISOString()}>{new Date(review.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })}</time>
      </div>
      <span className="customer-review-rating" aria-label={`${review.rating} out of 5 stars`}>{review.rating} ★</span>
    </div>
    <p>{review.text}</p>
  </article>;
}
