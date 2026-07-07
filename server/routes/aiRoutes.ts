import { Router } from 'express';
import { getAiRecommendations, getLatestAiRecommendation } from '../controllers/aiController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // protect all AI recommendations endpoints

router.post('/recommend', getAiRecommendations);
router.get('/recommend/latest', getLatestAiRecommendation);

export default router;
