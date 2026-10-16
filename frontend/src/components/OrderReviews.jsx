import { useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api/api';

function ReviewForm({ orderId, item, onSubmitted }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try {
      const data = await apiRequest(`/account/orders/${orderId}/reviews`, { method: 'POST', body: JSON.stringify({ productId: item.product, rating: Number(fields.get('rating')), text: fields.get('text') }) });
      onSubmitted(data.review);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  if (!open) return <button type="button" className="text-sm font-semibold underline" onClick={() => setOpen(true)}>Write a review</button>;
  return <form onSubmit={submit} className="mt-3 space-y-3">
    <label className="block text-sm font-semibold">Rating<select name="rating" required defaultValue="" disabled={busy} className="mt-1 block rounded-lg border border-gray-300 p-2"><option value="" disabled>Select a rating</option>{[5,4,3,2,1].map(value => <option key={value} value={value}>{value} {value === 1 ? 'star' : 'stars'}</option>)}</select></label>
    <label className="block text-sm font-semibold">Your review<textarea name="text" required maxLength={2000} rows={3} disabled={busy} className="mt-1 block w-full rounded-lg border border-gray-300 p-3" /></label>
    <p className="text-xs text-gray-500">Your review will appear on the product page after admin approval.</p>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="flex gap-3"><button disabled={busy} className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Submitting…' : 'Submit review'}</button><button type="button" disabled={busy} onClick={() => setOpen(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button></div>
  </form>;
}

export default function OrderReviews({ order }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [eligibility, setEligibility] = useState({ canSubmit: false, availableAt: null });
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const data = await apiRequest(`/account/orders/${order._id}/reviews`, { signal: controller.signal });
        if (!controller.signal.aborted) {
          setReviews(data.reviews);
          setEligibility({ canSubmit: data.canSubmit, availableAt: data.availableAt });
        }
      } catch (failure) { if (!controller.signal.aborted) setError(failure.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [order._id, attempt]);
  useEffect(() => {
    if (eligibility.canSubmit || !eligibility.availableAt) return;
    const delay = new Date(eligibility.availableAt).getTime() - Date.now();
    const timer = setTimeout(() => setAttempt(value => value + 1), Math.min(Math.max(delay + 1000, 1000), 2147483647));
    return () => clearTimeout(timer);
  }, [eligibility.canSubmit, eligibility.availableAt, attempt]);
  const items = useMemo(() => {
    const seen = new Set();
    return order.items.filter(item => {
      if (!item.product || seen.has(item.product)) return false;
      seen.add(item.product); return true;
    });
  }, [order.items]);
  const reviewsByProduct = useMemo(() => new Map(reviews.map(review => [review.product, review])), [reviews]);
  return <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
    <h3 className="text-sm font-bold">Review your delivered products</h3>
    {!loading && !error && !eligibility.canSubmit && <p role="status" className="text-sm text-gray-500">Reviews open two days (48 hours) after delivery.{eligibility.availableAt && ` Available from ${new Date(eligibility.availableAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST).`}</p>}
    {loading ? <p role="status" className="text-sm text-gray-500">Loading reviews…</p> : error ? <div><p role="alert" className="text-sm text-red-600">{error}</p><button onClick={() => setAttempt(value => value + 1)} className="text-sm underline">Try again</button></div> : items.map(item => {
      const review = reviewsByProduct.get(item.product);
      return <div key={item.product} className="rounded-lg border border-gray-200 p-3"><p className="mb-2 text-sm font-semibold">{item.name}</p>{review ? <div role="status"><p className="text-sm">{review.rating} ★ · {review.status === 'pending' ? 'Awaiting admin approval' : review.status === 'approved' ? 'Approved — visible on the product page' : 'Not approved'}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-500">{review.text}</p></div> : eligibility.canSubmit ? <ReviewForm orderId={order._id} item={item} onSubmitted={review => setReviews(previous => [...previous, review])} /> : null}</div>;
    })}
  </div>;
}
