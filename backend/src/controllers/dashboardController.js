import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { loggedInUserIds } from '../services/loginStatus.js';

const DAY = 86400000;
const OFFSET = 19800000;
export function dashboardRange(value = '7', now = new Date()) {
  if (!['7', '30', '90'].includes(value)) throw Object.assign(new Error('Choose a 7, 30, or 90 day range.'), { status: 400 });
  const days = Number(value);
  const end = new Date(Math.floor((now.getTime() + OFFSET) / DAY) * DAY - OFFSET + DAY);
  const start = new Date(end.getTime() - days * DAY);
  return { days, start, end, previousStart: new Date(start.getTime() - days * DAY) };
}
export function change(current, previous) {
  return previous ? Math.round((current - previous) / previous * 1000) / 10 : null;
}
export function salesSeries(range, rows) {
  const amounts = new Map(rows.map(row => [row._id, row.revenue]));
  return Array.from({ length: range.days }, (_, index) => {
    const date = new Date(range.start.getTime() + index * DAY + OFFSET).toISOString().slice(0, 10);
    return { date, revenue: amounts.get(date) || 0 };
  });
}

export async function dashboardSummary(req, res, next) {
  try {
    const range = dashboardRange(req.query.days);
    const recentPage=Number(req.query.recentPage??1);
    if(!Number.isSafeInteger(recentPage)||recentPage<1||recentPage>10000)throw Object.assign(new Error('Invalid recent-order page.'),{status:400});
    const online = loggedInUserIds();
    const periodGroup = { $group: { _id: null, orders: { $sum: 1 }, pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }, completed: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }, revenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalAmount', 0] } } } };
    const [users, activeUsers, products, aggregated, recentOrders] = await Promise.all([
      User.countDocuments({}),
      online.then(ids => User.countDocuments({ _id: { $in: ids }, status: { $ne: 'inactive' } })),
      Product.countDocuments({}),
      Order.aggregate([
        { $match: { createdAt: { $gte: range.previousStart, $lt: range.end } } },
        { $facet: {
          current: [{ $match: { createdAt: { $gte: range.start } } }, periodGroup],
          previous: [{ $match: { createdAt: { $lt: range.start } } }, periodGroup],
          statuses: [{ $match: { createdAt: { $gte: range.start } } }, { $group: { _id: '$status', count: { $sum: 1 } } }],
          sales: [{ $match: { createdAt: { $gte: range.start }, status: 'delivered' } }, { $group: { _id: { $dateToString: { date: '$createdAt', format: '%Y-%m-%d', timezone: 'Asia/Kolkata' } }, revenue: { $sum: '$totalAmount' } } }],
        } },
      ]),
      Order.find({ createdAt: { $gte: range.start, $lt: range.end } }).select('orderId user shipping.name totalAmount status createdAt').populate('user', 'name').sort({ createdAt: -1, _id: -1 }).skip((recentPage-1)*5).limit(5).lean(),
    ]);
    const summary = aggregated[0] || {};
    const current = { orders: 0, pending: 0, completed: 0, revenue: 0, ...summary.current?.[0] };
    const previous = { orders: 0, pending: 0, completed: 0, revenue: 0, ...summary.previous?.[0] };
    const statuses = new Map((summary.statuses || []).map(row => [row._id, row.count]));
    res.json({
      success: true, range: { days: range.days, start: range.start, end: range.end, timezone: 'Asia/Kolkata' },
      stats: { users, activeUsers, inactiveUsers: users - activeUsers, products, orders: current.orders, pending: current.pending, completed: current.completed, revenue: current.revenue },
      changes: Object.fromEntries(['orders', 'pending', 'completed', 'revenue'].map(key => [key, change(current[key], previous[key])])),
      sales: salesSeries(range, summary.sales || []),
      statuses: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => ({ status, count: statuses.get(status) || 0 })),
      recentPagination: {page:recentPage,pageSize:5,total:current.orders},
      recentOrders: recentOrders.map(order => ({ id: String(order._id), orderId: order.orderId, customer: order.user?.name || order.shipping?.name || 'Deleted account', totalAmount: order.totalAmount, status: order.status, createdAt: order.createdAt })),
    });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    next(error);
  }
}
