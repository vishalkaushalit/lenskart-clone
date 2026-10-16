import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, Clock3 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { apiRequest } from '../api';
import { orderTimeline } from '../../../shared/orderTimeline.js';
import { shipmentMessage } from '../../../shared/shipment.js';

const date = value => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
export default function OrderTracking() {
  const { id } = useParams();
  const [result, setResult] = useState({ loading: true });
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    let inFlight = false;
    let terminal = false;
    async function load() {
      if (inFlight || controller.signal.aborted) return;
      inFlight = true; setRefreshing(true);
      try {
        const data = await apiRequest(`/admin/orders/${encodeURIComponent(id)}`, { signal: controller.signal });
        if (!controller.signal.aborted) {
          terminal = ['delivered', 'cancelled'].includes(data.order.status);
          setResult({ id, order: data.order, checkedAt: new Date(), loading: false });
        }
      } catch (error) {
        if (!controller.signal.aborted) setResult(previous => previous.id === id && previous.order ? { ...previous, error: error.message } : { id, error: error.message, loading: false });
      } finally { inFlight = false; if (!controller.signal.aborted) setRefreshing(false); }
    }
    load();
    const timer = setInterval(() => { if (!document.hidden && !terminal) load(); }, 30000);
    return () => { controller.abort(); clearInterval(timer); };
  }, [id, attempt]);
  const order = result.id === id ? result.order : null;
  return <DashboardLayout><main className="admin-page">
    <PageHeader title="Order Tracking" description={order ? `Order #${order.orderId ?? '—'} · ${order.user?.name || 'Deleted account'}` : 'View shipment progress and timeline'}>
      <Link to="/track-orders" className="admin-button-secondary">Back to tracking</Link>
      <Link to={`/orders/${id}`} className="admin-button-secondary">Order details</Link>
      <Link to={`/orders/${id}/edit`} className="admin-button-primary">Update shipment</Link>
      <button disabled={refreshing} onClick={() => setAttempt(value => value + 1)} className="admin-button-secondary">{refreshing ? 'Refreshing…' : 'Refresh'}</button>
    </PageHeader>
    {result.loading || result.id !== id ? <Loader label="Loading order tracking" /> : <>
      {result.error && <p role="alert" className="text-sm text-red-600">{result.error}</p>}
      {order && <div className="grid items-start gap-5 lg:grid-cols-2">
        <section className="product-panel"><h2 className="product-panel-title">Shipment details</h2><p role="status" className="mb-5 text-sm font-semibold">{shipmentMessage(order) || `Order ${order.status}`}</p>
          <dl className="grid gap-4 text-sm"><div><dt className="text-slate-500">Carrier</dt><dd>{order.carrier || 'Not assigned'}</dd></div><div><dt className="text-slate-500">Waybill / tracking number</dt><dd className="break-all font-semibold">{order.trackingNumber || 'Not generated'}</dd></div><div><dt className="text-slate-500">Booked</dt><dd>{order.shipmentBookedAt ? `${date(order.shipmentBookedAt)} IST` : 'Time not recorded'}</dd></div><div><dt className="text-slate-500">Carrier collection</dt><dd>{order.carrierCollectedAt ? `${date(order.carrierCollectedAt)} IST` : 'Not recorded'}</dd></div></dl>
          <h3 className="mt-6 text-sm font-semibold">Customer</h3><p className="mt-2 text-sm text-slate-500">{order.user?.name || 'Deleted account'}<br />{order.user?.email}</p>
          {order.shipping && <><h3 className="mt-6 text-sm font-semibold">Delivery address</h3><p className="mt-2 text-sm text-slate-500">{order.shipping.name}<br />{order.shipping.address}<br />{order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</p></>}
        </section>
        <section className="product-panel"><h2 className="product-panel-title">Order timeline</h2><ol>{orderTimeline(order).map((step, index, steps) => <li key={step.status} aria-current={step.current ? 'step' : undefined} className="relative flex gap-4 pb-8 last:pb-0">
          {index < steps.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-8 w-0.5 bg-slate-200" />}
          <span aria-hidden="true" className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step.status === 'cancelled' ? 'bg-red-100 text-red-700' : step.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{step.complete ? <Check size={16} /> : <Clock3 size={16} />}</span>
          <div><h3 className="text-sm font-semibold">{step.label}{step.current && <span className="ml-2 text-xs text-blue-600">Current</span>}</h3><p className="mt-1 text-xs text-slate-500">{step.complete ? step.description : 'Upcoming'}</p>{step.at ? <time dateTime={new Date(step.at).toISOString()} className="mt-1 block text-xs text-slate-500">{date(step.at)} IST</time> : step.complete && <p className="mt-1 text-xs text-slate-500">Time not recorded</p>}</div>
        </li>)}</ol><p className="mt-6 text-xs text-slate-500">Last checked {date(result.checkedAt)} IST.{!['delivered','cancelled'].includes(order.status) && ' Updates every 30 seconds while visible.'}</p></section>
      </div>}
    </>}
  </main></DashboardLayout>;
}
