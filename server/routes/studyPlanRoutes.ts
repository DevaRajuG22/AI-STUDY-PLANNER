import { Router } from 'express';
import { 
  getStudyPlans, 
  createStudyPlan, 
  updateStudyPlan, 
  completeStudySession, 
  deleteStudyPlan 
} from '../controllers/studyPlannerController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // protect all study plan endpoints

router.route('/')
  .get(getStudyPlans)
  .post(createStudyPlan);

router.route('/:id')
  .put(updateStudyPlan)
  .delete(deleteStudyPlan);

router.post('/:id/complete', completeStudySession);

export default router;
