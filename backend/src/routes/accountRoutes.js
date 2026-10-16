import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { updateProfile, listOrders } from '../controllers/accountController.js';
import { orderReviews, submitReview } from '../controllers/reviewController.js';

const router = express.Router();
router.use(requireAuth);
router.patch('/profile', updateProfile);
router.get('/orders', listOrders);
router.get('/orders/:id/reviews', orderReviews);
router.post('/orders/:id/reviews', submitReview);

export default router;
