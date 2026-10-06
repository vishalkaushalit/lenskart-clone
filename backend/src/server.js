import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import { publicProducts, managedProducts } from './routes/productRoutes.js';
import express from 'express';
import {publicCategories,adminCategories} from './routes/categoryRoutes.js';
import {commerceAdmin,commercePublic} from './routes/commerceRoutes.js';
import cors from 'cors';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import { connectDB } from './config/db.js';
import User from './models/User.js';
import Order from './models/Order.js';
import Coupon from './models/Coupon.js';
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { initializeUserIds } from './services/userIds.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import ProductVariant from './models/ProductVariant.js';

const app = express();
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json({ limit: '512kb' }));

// Check the origin of browser requests that change data.
app.use((req, res, next) => {
  const unsafeMethod = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  const origin = req.get('Origin');

  if (unsafeMethod && origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Request origin is not allowed.',
    });
  }

  if (unsafeMethod && req.get('Sec-Fetch-Site') === 'cross-site') {
    return res.status(403).json({
      success: false,
      message: 'Cross-site requests are not allowed.',
    });
  }

  next();
});

app.get(['/', '/api/health'], (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    success: connected,
    message: 'Backend is running',
    database: connected ? 'Connected' : 'Disconnected',
  });
});

async function startServer() {
  try {
    if (!process.env.SESSION_SECRET) {
      throw new Error('SESSION_SECRET is required');
    }

    await connectDB();
    await initializeUserIds(User.collection);
    await User.init();

    const sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      collectionName: 'sessions',
    });

    sessionStore.on('error', (error) => {
      console.error('Session store error:', error.name);
    });

    app.use(session({
      name: 'store.sid',
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      },
    }));

    await Promise.all([Order.init(),Coupon.init(),ProductVariant.init()]);
    app.use('/api/categories',publicCategories);
    app.use('/api/admin/categories',adminCategories);
    app.use('/api/admin', commerceAdmin);
    app.use('/api/admin/dashboard', dashboardRoutes);
    app.use('/api', commercePublic);
    app.use('/api/auth', authRoutes);
    app.use('/api/account', accountRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/products', publicProducts);
    app.use('/api/admin/products', managedProducts);
    app.use('/assets/products', express.static(fileURLToPath(new URL('../public/products/', import.meta.url)),{maxAge:'7d',etag:true}));

    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
      });
    });

    app.use((error, req, res, next) => {
      console.error('Request failed:', error.name);

      res.status(error.status === 413 ? 413 : 500).json({
        success: false,
        message: error.status === 413 ? (req.is('application/json')?'The form is too large. Reduce the content and try again.':'Each image must be smaller than 5 MB.') : 'Something went wrong. Please try again.',
      });
    });

    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Backend startup failed:", error.name);
    console.error("Error code:", error.code);
    console.error("Details:", error.message);
    process.exit(1);
  }
}

startServer();

/*
  This configuration is for your current localhost setup. Production needs HTTPS;
  if hosted behind a proxy, configure Express’s trust proxy to match your hosting
  setup so secure cookies work.
*/
