import { Router } from 'express';
import { getHabits, createHabit, toggleHabitCompletion, deleteHabit } from '../controllers/habitController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // protect all habit endpoints

router.route('/')
  .get(getHabits)
  .post(createHabit);

router.post('/:id/toggle', toggleHabitCompletion);
router.delete('/:id', deleteHabit);

export default router;
