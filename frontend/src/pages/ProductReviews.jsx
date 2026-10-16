import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiRequest } from '../api/api';
import Loader from '../components/Loader';
import ReviewCard from '../components/ReviewCard';

export default function ProductReviews() {
  const { id } = useParams();
  const [result, setResult] = useState({ loading: true });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    async function load(background = false) {
      if (inFlight) return;
      inFlight = true;
      if (!background) setResult({ loading: true });
      try {
        const data = await apiRequest(`/products/${encodeURIComponent(id)}`, { signal: controller.signal });
        if (!controller.signal.aborted) setResult({ product: data.product, loading: false });
      } catch (error) {
        if (!controller.signal.aborted && !background) setResult({ loading: false, error: error.message });
      } finally { inFlight = false; }
    }
    load();
    function refresh() { if (!document.hidden) load(true); }
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      controller.abort();
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [id, attempt]);
  return <section className="store-container py-10 sm:py-14">
    <Link to={`/products/${id}`} className="text-sm font-semibold underline">Back to product</Link>
    <h1 className="mt-5 text-2xl font-bold text-ink">All reviews{result.product && ` for ${result.product.name}`}</h1>
    {result.loading ? <Loader label="Loading reviews" /> : result.error ? <div className="mt-5"><p role="alert">{result.error}</p><button onClick={() => setAttempt(value => value + 1)} className="mt-3 underline">Try again</button></div> : <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 sm:p-8">
      <p className="text-sm text-gray-500">{result.product.reviews?.length || 0} reviews · Newest first</p>
      {result.product.reviews?.length ? result.product.reviews.map((review, index) => <ReviewCard key={review._id || index} review={review} />) : <p className="mt-5 text-sm">No customer reviews available yet.</p>}
    </div>}
  </section>;
}
