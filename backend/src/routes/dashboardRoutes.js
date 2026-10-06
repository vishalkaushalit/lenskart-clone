import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { dashboardSummary } from '../controllers/dashboardController.js';
const router = express.Router();
router.use(requireAuth, requireRole('admin'));
router.get('/', dashboardSummary);
export default router;
