import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import CustomerReview from '../models/CustomerReview.js';
const validId = value => typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);

export async function deleteCategory(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid category ID.' });
  try {
    if (await Category.exists({ parent: req.params.id })) return res.status(409).json({ message: 'Delete subcategories first, or disable this category.' });
    if (await Product.exists({ $or: ['categoryId', 'subcategoryId', 'categoryIds', 'subcategoryIds'].map(field => ({ [field]: req.params.id })) })) return res.status(409).json({ message: 'This category is assigned to products. Remove those assignments or disable it first.' });
    const row = await Category.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ message: 'Category not found.' });
    res.json({ success: true });
  } catch (error) { next(error); }
}
export async function deleteCoupon(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid coupon ID.' });
  try {
    if (!await Coupon.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Coupon not found.' });
    res.json({ success: true });
  } catch (error) { next(error); }
}
export async function deleteCancelledOrder(req, res, next) {
  if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid order ID.' });
  let session;
  try {
    session = await mongoose.startSession();
    let deleted = false;
    await session.withTransaction(async () => {
      if (await CustomerReview.exists({ order: req.params.id }).session(session)) return;
      const row = await Order.findOneAndDelete({ _id: req.params.id, status: 'cancelled' }, { session });
      deleted = Boolean(row);
    });
    if (!deleted) return res.status(409).json({ message: 'Only cancelled orders without customer reviews can be deleted. Completed orders are retained.' });
    res.json({ success: true });
  } catch (error) { next(error); }
  finally { if (session) await session.endSession(); }
}
