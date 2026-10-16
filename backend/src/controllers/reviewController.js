import Order from '../models/Order.js';
import Product from '../models/Product.js';
import CustomerReview from '../models/CustomerReview.js';

const validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
export function reviewAvailableAt(order) {
  if (order?.status !== 'delivered') return null;
  const delivered = order.deliveredAt || order.updatedAt;
  const time = delivered ? new Date(delivered).getTime() : NaN;
  return Number.isFinite(time) ? new Date(time + 2 * 24 * 60 * 60 * 1000) : null;
}
export function canReview(order, productId, now = new Date()) {
  const availableAt = reviewAvailableAt(order);
  return Boolean(availableAt) && availableAt.getTime() <= now.getTime() &&
    order.items.some(item => String(item.product) === productId);
}
function failure(error, res, next) {
  if (error.code === 11000) return res.status(409).json({ message: 'You have already reviewed this product in this order.' });
  if (error.name === 'ValidationError') return res.status(400).json({ message: 'Enter a rating from 1 to 5 and a review of 1–2000 characters.' });
  next(error);
}
export async function orderReviews(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid order ID.' });
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    const reviews = await CustomerReview.find({ order: order._id, user: req.user._id }).select('product rating text status createdAt').lean();
    const availableAt = reviewAvailableAt(order);
    res.json({ reviews, availableAt, canSubmit: Boolean(availableAt) && availableAt.getTime() <= Date.now() });
  } catch (error) { next(error); }
}
export async function submitReview(req, res, next) {
  const { productId, rating, text } = req.body || {};
  if (!validId(req.params.id) || !validId(productId) || !Number.isInteger(rating) || rating < 1 || rating > 5 || typeof text !== 'string' || !text.trim() || text.trim().length > 2000) {
    return res.status(400).json({ message: 'Choose a purchased product, a rating from 1 to 5 and a review of 1–2000 characters.' });
  }
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).lean();
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    if (!canReview(order, productId)) return res.status(403).json({ message: 'You can review purchased products only two days (48 hours) after delivery.' });
    if (!await Product.exists({ _id: productId })) return res.status(404).json({ message: 'Product no longer exists.' });
    const review = await CustomerReview.create({ user: req.user._id, order: order._id, product: productId, name: req.user.name, rating, text: text.trim(), status: 'pending' });
    res.status(201).json({ review: { product: review.product, rating: review.rating, text: review.text, status: review.status, createdAt: review.createdAt } });
  } catch (error) { failure(error, res, next); }
}
export async function listReviews(req, res, next) {
  const page = Number(req.query.page || 1);
  const status = req.query.status || 'all';
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000 || !['all', 'unapproved', 'pending', 'approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Invalid review page or status.' });
  try {
    const filter = status === 'all' ? {} : { status: status === 'unapproved' ? { $in: ['pending', 'rejected'] } : status };
    const [total, reviews] = await Promise.all([
      CustomerReview.countDocuments(filter),
      CustomerReview.find(filter).populate('product', 'name slug').populate('order', 'orderId deliveredAt updatedAt').sort({ createdAt: -1, _id: -1 }).skip((page - 1) * 20).limit(20).lean(),
    ]);
    res.json({ reviews, total, page });
  } catch (error) { next(error); }
}
export async function moderateReview(req, res, next) {
  if (!validId(req.params.id) || !['pending', 'approved', 'rejected'].includes(req.body?.status)) return res.status(400).json({ message: 'Choose approve, reject or unapprove.' });
  try {
    const sourceStatus = req.body.status === 'approved' ? { $in: ['pending', 'rejected'] } : req.body.status === 'pending' ? 'approved' : 'pending';
    const review = await CustomerReview.findOneAndUpdate({ _id: req.params.id, status: sourceStatus }, { $set: { status: req.body.status, moderatedBy: req.user._id, moderatedAt: new Date() } }, { new: true, runValidators: true });
    if (!review) return res.status(409).json({ message: 'Review not found or already moderated. Refresh the list.' });
    res.json({ review });
  } catch (error) { next(error); }
}
export async function approvedReviews(productId) {
  const rows = await CustomerReview.find({ product: productId, status: 'approved' }).select('name rating text createdAt').sort({ createdAt: -1, _id: -1 }).lean();
  return rows.map(row => ({ name: row.name, rating: row.rating, text: row.text, date: row.createdAt, verifiedPurchase: true }));
}

export async function deleteReview(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid review ID.' });
  try {
    const review = await CustomerReview.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found.' });
    res.json({ success: true });
  } catch (error) { next(error); }
}
