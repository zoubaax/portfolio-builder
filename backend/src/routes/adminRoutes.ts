import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.js';

const router = Router();

// Protect all admin endpoints with adminAuthMiddleware
router.use(adminAuthMiddleware);

router.get('/verify', adminController.verifyAuth);
router.get('/dashboard', adminController.getDashboardData);
router.get('/users', adminController.getUsers);
router.get('/logs', adminController.getLogs);

export default router;
