import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import { apiRequest } from '../api';
import { creationDate } from '../date';

export default function Reviews() {
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState({ reviews: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true); setError('');
      try {
        const result = await apiRequest(`/admin/reviews?status=${status}&page=${page}`, { signal: controller.signal });
        if (!controller.signal.aborted) setData(result);
      } catch (failure) { if (!controller.signal.aborted) setError(failure.message); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load(); return () => controller.abort();
  }, [status, page, attempt]);
  async function moderate(id, decision) {
    setBusy(true); setError('');
    try {
      await apiRequest(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ status: decision }) });
      if (status !== 'all' && data.reviews.length === 1 && page > 1) setPage(value => value - 1);
      else setAttempt(value => value + 1);
    } catch (failure) { setError(failure.message); }
    finally { setBusy(false); }
  }
  return <DashboardLayout><main className="admin-page">
    <PageHeader title="Customer Reviews" description="Approve delivered-purchase reviews before they appear on product pages."><button className="admin-button-secondary" disabled={busy || loading} onClick={() => setAttempt(value => value + 1)}>Refresh</button></PageHeader>
    <label className="product-label">Review status<select className="product-field max-w-xs" value={status} disabled={busy} onChange={event => { setStatus(event.target.value); setPage(1); }}>{['all', 'pending', 'approved', 'rejected'].map(value => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <DataTable label="Customer reviews" footer={!loading && <Pagination page={page} total={data.total} onPageChange={setPage} disabled={busy} label="reviews" />}>
      <thead><tr>{['Sr. No.', 'Product', 'Customer', 'Order / Delivery', 'Rating', 'Review', 'Submitted', 'Actions'].map(label => <th key={label}>{label}</th>)}</tr></thead>
      <tbody>{loading ? <tr><td colSpan={8}><Loader /></td></tr> : !data.reviews.length ? <tr><td colSpan={8}>No {status === 'all' ? '' : `${status} `}reviews.</td></tr> : data.reviews.map((review, index) => <tr key={review._id}>
        <td>{(page - 1) * 20 + index + 1}</td><td>{review.product ? <Link className="text-blue-600" to={`/product/${review.product._id}`}>{review.product.name}</Link> : 'Deleted product'}</td><td>{review.name}</td>
        <td>{review.order ? <><Link className="text-blue-600" to={`/orders/${review.order._id}`}>#{review.order.orderId ?? '—'}</Link><p>{creationDate(review.order.deliveredAt || review.order.updatedAt)}</p></> : 'Deleted order'}</td>
        <td>{review.rating} ★</td><td><p className="min-w-48 max-w-md whitespace-pre-wrap break-words">{review.text}</p></td><td>{creationDate(review.createdAt)}</td>
        <td>{review.status === 'pending' ? <div className="flex gap-2"><button disabled={busy} onClick={() => moderate(review._id, 'approved')} className="admin-button-primary">Approve</button><button disabled={busy} onClick={() => moderate(review._id, 'rejected')} className="admin-button-secondary">Reject</button></div> : <div className="flex items-center gap-2"><span className="capitalize">{review.status}</span>{review.status === 'approved' && <button disabled={busy} onClick={() => moderate(review._id, 'pending')} className="admin-button-secondary">Unapprove</button>}</div>}</td>
      </tr>)}</tbody>
    </DataTable>
  </main></DashboardLayout>;
}
