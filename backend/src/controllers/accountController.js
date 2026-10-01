import User from '../models/User.js';
import Order from '../models/Order.js';

export async function updateProfile(req, res, next) {
  const { name, email } = req.body ?? {};
  if (typeof name !== 'string' || typeof email !== 'string') {
    return res.status(400).json({ message: 'Name and email are required.' });
  }
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanName || cleanName.length > 100) {
    return res.status(400).json({ message: 'Name must contain 1–100 characters.' });
  }
  if (cleanEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address.' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name: cleanName, email: cleanEmail } },
      { new: true, runValidators: true },
    );
    if (!user) return res.status(401).json({ message: 'Account not found. Please log in again.' });
    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }
    next(error);
  }
}

export async function listOrders(req, res, next) {
  const page = Number(req.query.page ?? 1);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
    return res.status(400).json({ message: 'Enter a valid order history page.' });
  }
  try {
    const pageSize = 10;
    const orders = await Order.find({ user: req.user._id })
      .select('items totalAmount currency status createdAt')
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize + 1)
      .lean();
    return res.json({
      success: true,
      orders: orders.slice(0, pageSize),
      page,
      hasMore: orders.length > pageSize,
    });
  } catch (error) {
    next(error);
  }
}
