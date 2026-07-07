import { Router } from 'express';
import { getReportStats } from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/stats', protect, getReportStats);

export default router;
