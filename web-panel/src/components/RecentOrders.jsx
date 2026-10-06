import Pagination from './Pagination';
import { Link } from 'react-router-dom';
import DataTable from './DataTable';
import StatusBadge from './StatusBadge';
const date = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata' });
const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });
export default function RecentOrders({ orders, pagination, onPageChange, loading }) {
  return <DataTable footer={<Pagination page={pagination.page} pageSize={pagination.pageSize} total={pagination.total} onPageChange={onPageChange} disabled={loading} label="recent orders"/>} label="Recent orders" minWidth={640} header={<div className="flex items-center justify-between"><h2 className="text-base font-semibold text-slate-800">Recent Orders</h2><Link to="/orders" className="text-sm font-medium text-blue-600 hover:underline">View All</Link></div>}>
    <thead><tr>{['Sr. No.', 'Order ID', 'Customer', 'Amount', 'Status', 'Created On'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
    <tbody>{!orders.length ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">No orders in this period.</td></tr> : orders.map((order, index) => <tr key={order.id}>
      <td>{(pagination.page-1)*pagination.pageSize+index+1}</td><td><Link to={`/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">#{order.orderId ?? '—'}</Link></td><td>{order.customer}</td><td>{money.format(order.totalAmount)}</td><td><StatusBadge status={order.status} /></td><td className="whitespace-nowrap text-slate-500">{date.format(new Date(order.createdAt))}</td>
    </tr>)}</tbody>
  </DataTable>;
}
