import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateProfile, listOrders } from '../controllers/accountController.js';

const router = express.Router();
router.use(requireAuth);
router.patch('/profile', updateProfile);
router.get('/orders', listOrders);

export default router;
