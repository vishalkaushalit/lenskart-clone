import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { loggedInUserIds } from '../services/loginStatus.js';

function positiveInteger(value, fallback, maximum) {
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed <= maximum ? parsed : null;
}

export async function editUser(req, res, next) {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id)) return res.status(400).json({ message: 'Invalid user ID.' });
  const fields = {};
  const body = req.body ?? {};
  if (Object.hasOwn(body, 'name')) {
    if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 100) {
      return res.status(400).json({ message: 'Name must contain 1–100 characters.' });
    }
    fields.name = body.name.trim();
  }
  if (Object.hasOwn(body, 'email')) {
    if (typeof body.email !== 'string' || body.email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }
    fields.email = body.email.trim().toLowerCase();
  }
  if (Object.hasOwn(body, 'role')) {
    if (!['customer', 'admin'].includes(body.role)) return res.status(400).json({ message: 'Choose a valid role.' });
    if (String(req.user._id).toLowerCase() === id.toLowerCase() && body.role !== 'admin') {
      return res.status(403).json({ message: 'You cannot remove your own admin access.' });
    }
    fields.role = body.role;
  }
  if (Object.hasOwn(body, 'phone')) {
    if (typeof body.phone !== 'string' || body.phone.trim().length > 30) return res.status(400).json({ message: 'Phone must contain at most 30 characters.' });
    fields.phone = body.phone.trim();
  }
  if (Object.hasOwn(body, 'status')) {
    if (!['active', 'inactive'].includes(body.status)) return res.status(400).json({ message: 'Choose a valid status.' });
    if (String(req.user._id).toLowerCase() === id.toLowerCase() && body.status === 'inactive') return res.status(403).json({ message: 'You cannot deactivate your own account.' });
    fields.status = body.status;
  }
  if (!Object.keys(fields).length) return res.status(400).json({ message: 'Provide a name, email, or role to update.' });
  try {
    const user = await User.findByIdAndUpdate(id, { $set: fields }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ success: true, user: {
      id: user._id, userId: user.userId, name: user.name, email: user.email, role: user.role,
      createdAt: user.createdAt, updatedAt: user.updatedAt,
    } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  const { id } = req.params;
  if (!/^[a-f\d]{24}$/i.test(id)) return res.status(400).json({ message: 'Invalid user ID.' });
  if (String(req.user._id).toLowerCase() === id.toLowerCase()) return res.status(403).json({ message: 'You cannot delete your own account.' });
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function listUsers(req, res, next) {
  const page = positiveInteger(req.query.page, 1, 10000);
  const limit = positiveInteger(req.query.limit, 20, 100);
  if (page === null || limit === null) {
    return res.status(400).json({
      success: false,
      message: 'Page must be an integer from 1 to 10000 and limit from 1 to 100.',
    });
  }

  const search = req.query.search ?? '';
  const status = req.query.status ?? '';
  const sort = req.query.sort ?? 'newest';
  const sortOrders = {
    newest: { createdAt: -1, _id: -1 },
    oldest: { createdAt: 1, _id: 1 },
    'name-asc': { name: 1, _id: 1 },
    'name-desc': { name: -1, _id: -1 },
  };
  if (typeof sort !== 'string' || !Object.hasOwn(sortOrders, sort)) return res.status(400).json({ message: 'Choose a valid sort order.' });
  if (typeof search !== 'string' || search.length > 100 || !['', 'active', 'inactive'].includes(status)) return res.status(400).json({ message: 'Invalid search or status.' });
  const filter = {};
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = ['name', 'email', 'phone'].map((field) => ({ [field]: { $regex: escaped, $options: 'i' } }));
  }
  try {
    const loggedInIds = await loggedInUserIds();
    const online = new Set(loggedInIds.map(String));
    const activeFilter = { _id: { $in: loggedInIds }, status: { $ne: 'inactive' } };
    if (status === 'active') Object.assign(filter, activeFilter);
    if (status === 'inactive') filter.$nor = [activeFilter];
    const [users, total, all, active] = await Promise.all([
      User.find(filter)
        .select('_id userId name email phone status role createdAt updatedAt')
        .collation({ locale: 'en', strength: 2 })
        .sort(sortOrders[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
      User.countDocuments({}),
      User.countDocuments(activeFilter),
    ]);

    return res.json({
      success: true,
      users: users.map((user) => ({
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        status: online.has(String(user._id)) && user.status !== 'inactive' ? 'active' : 'inactive',
        accountStatus: user.status || 'active',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      counts: { all, active, inactive: all - active },
    });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req, res, next) {
  const { name, email, password, phone = '', status = 'active', role = 'customer' } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || name.trim().length > 100 || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72 || typeof phone !== 'string' || phone.length > 30 || !['active', 'inactive'].includes(status) || !['customer', 'admin'].includes(role)) return res.status(400).json({ message: 'Enter a valid name, email, password (8–72 bytes), phone, role, and status.' });
  try {
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12), phone: phone.trim(), status, role });
    return res.status(201).json({ success: true, user: { id: user._id, userId: user.userId, name: user.name, email: user.email, role: user.role, phone: user.phone, status: user.status, createdAt: user.createdAt } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
    next(error);
  }
}
