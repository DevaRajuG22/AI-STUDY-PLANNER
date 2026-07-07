import { Router } from 'express';
import { getReminders, createReminder, dismissReminder, deleteReminder } from '../controllers/reminderController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect); // protect all reminder endpoints

router.route('/')
  .get(getReminders)
  .post(createReminder);

router.post('/:id/dismiss', dismissReminder);
router.delete('/:id', deleteReminder);

export default router;
