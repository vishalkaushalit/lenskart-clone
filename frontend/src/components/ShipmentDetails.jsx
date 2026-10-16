import { shipmentMessage } from '../utils/shipment';

export default function ShipmentDetails({ order }) {
  if (!order.trackingNumber) return null;
  return <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
    <p className="text-sm font-semibold">{shipmentMessage(order)}</p>
    {order.carrier && <p className="mt-2 text-sm text-gray-500">Carrier: {order.carrier}</p>}
    <p className="mt-1 break-all text-sm">Waybill / tracking number: <span className="font-semibold">{order.trackingNumber}</span></p>
  </div>;
}
