import FrameSizeBadge from '../components/FrameSizeBadge';
import { useOrderTracking } from '../../../shared/useOrderTracking.js';
import { Link, useParams } from 'react-router-dom';
import { Check, Clock3, Package, Truck } from 'lucide-react';
import Loader from '../components/Loader';
import ShipmentDetails from '../components/ShipmentDetails';
import { shipmentMessage } from '../utils/shipment';
import { apiRequest } from '../api/api';
import { orderTimeline } from '../utils/orderTimeline';

const date = value => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
export default function OrderTracker() {
  const { id } = useParams();
  const { result, refreshing, refresh } = useOrderTracking(id, apiRequest, '/orders');
  const order = result.id === id ? result.order : null;
  return <section className="store-container py-10 sm:py-14">
    <Link to="/profile?tab=orders" className="text-sm font-semibold underline">Back to my orders</Link>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><h1 className="flex items-center gap-2 text-2xl font-bold text-ink"><Truck aria-hidden="true" />Track your order{order && ` #${order.orderId ?? '—'}`}</h1><button disabled={refreshing} onClick={refresh} className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-50">{refreshing ? 'Refreshing…' : 'Refresh status'}</button></div>
    {result.loading || result.id !== id ? <Loader label="Loading order tracking" /> : <>
      {result.error && <p role="alert" className="mt-5 text-sm text-red-600">{result.error}</p>}
      {order && <div className="mt-6 grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6" aria-labelledby="timeline-title">
          <h2 id="timeline-title" className="text-lg font-bold">Order timeline</h2>
          <p role="status" className="mt-2 text-sm text-gray-500">Current status: <span className="font-semibold capitalize text-ink">{order.trackingNumber ? shipmentMessage(order) : order.status}</span></p>
          <ShipmentDetails order={order} />
          <ol className="mt-6">{orderTimeline(order).map((step, index, steps) => <li key={step.status} aria-current={step.current ? 'step' : undefined} className="relative flex gap-4 pb-8 last:pb-0">
            {index < steps.length - 1 && <span aria-hidden="true" className={`absolute bottom-0 left-[15px] top-8 w-0.5 ${step.complete ? 'bg-emerald-200' : 'bg-gray-200'}`} />}
            <span aria-hidden="true" className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${step.status === 'cancelled' ? 'bg-red-100 text-red-700' : step.complete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>{step.complete ? <Check size={16} /> : <Clock3 size={16} />}</span>
            <div><h3 className={`font-semibold ${step.complete ? 'text-ink' : 'text-gray-500'}`}>{step.label}{step.current && <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs">Current</span>}</h3><p className="mt-1 text-sm text-gray-500">{step.complete ? step.description : 'Upcoming'}</p>{step.at ? <time dateTime={new Date(step.at).toISOString()} className="mt-1 block text-xs text-gray-500">{date(step.at)} IST</time> : step.complete && <p className="mt-1 text-xs text-gray-500">Time not recorded</p>}</div>
          </li>)}</ol>
          <p className="mt-6 text-xs text-gray-500">Last checked {date(result.checkedAt)} IST.{!['delivered', 'cancelled'].includes(order.status) && ' Updates every 30 seconds while this page is visible.'}</p>
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-6" aria-labelledby="tracked-items"><h2 id="tracked-items" className="flex items-center gap-2 text-lg font-bold"><Package size={20} aria-hidden="true" />Your items</h2><ul className="mt-5 space-y-4">{order.items.map((item, index) => <li key={item._id || index}><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-gray-500">{item.options?.color} {item.options?.color && ' · '}<FrameSizeBadge size={item.options?.size}/> · Quantity: {item.quantity}</p></li>)}</ul>
          {order.shipping && <div className="mt-6 border-t border-gray-200 pt-5"><h3 className="font-semibold">Delivering to</h3><p className="mt-2 text-sm text-gray-500">{order.shipping.name}<br />{order.shipping.address}<br />{order.shipping.city}, {order.shipping.state} {order.shipping.pincode}</p></div>}
          {order.status === 'delivered' && <Link to={`/profile?tab=orders#order-${order._id}`} className="mt-6 inline-block text-sm font-semibold underline">Review your purchase</Link>}
        </section>
      </div>}
    </>}
  </section>;
}
