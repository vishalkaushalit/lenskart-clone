import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { listUsers, editUser, deleteUser, createUser, userDetails } from '../controllers/userController.js';

const router = express.Router();
router.get('/', requireAuth, requireRole('admin'), listUsers);
router.get('/:id', requireAuth, requireRole('admin'), userDetails);
router.post('/', requireAuth, requireRole('admin'), createUser);
router.patch('/:id', requireAuth, requireRole('admin'), editUser);
router.delete('/:id', requireAuth, requireRole('admin'), deleteUser);

export default router;
