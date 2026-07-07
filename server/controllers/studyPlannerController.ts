import { Response } from 'express';
import { StudyPlan } from '../config/db';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc Get all study plans for a user
 * @route GET /api/study-plans
 * @access Private
 */
export const getStudyPlans = async (req: AuthRequest, res: Response) => {
  try {
    const plans = await StudyPlan.find({ userId: req.user!.id });
    res.json(plans);
  } catch (error) {
    console.error('Get Study Plans Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Create study plan
 * @route POST /api/study-plans
 * @access Private
 */
export const createStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { subject, studyHours, priority, studyDates } = req.body;

    if (!subject || !studyHours || !priority || !studyDates || !Array.isArray(studyDates)) {
      return res.status(400).json({ message: 'Please provide subject, studyHours, priority, and studyDates' });
    }

    const newPlan = await StudyPlan.create({
      userId: req.user!.id,
      subject,
      studyHours: Number(studyHours),
      priority,
      studyDates,
      completed: false,
      completedDates: []
    });

    res.status(201).json(newPlan);
  } catch (error) {
    console.error('Create Study Plan Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Update study plan
 * @route PUT /api/study-plans/:id
 * @access Private
 */
export const updateStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { subject, studyHours, priority, studyDates, completed } = req.body;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    if (plan.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await StudyPlan.findByIdAndUpdate(id, {
      subject: subject !== undefined ? subject : plan.subject,
      studyHours: studyHours !== undefined ? Number(studyHours) : plan.studyHours,
      priority: priority !== undefined ? priority : plan.priority,
      studyDates: studyDates !== undefined ? studyDates : plan.studyDates,
      completed: completed !== undefined ? completed : plan.completed,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update Study Plan Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Complete a study plan session (add completion date)
 * @route POST /api/study-plans/:id/complete
 * @access Private
 */
export const completeStudySession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.body; // e.g., "2026-07-07"

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    if (plan.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const completedDates = plan.completedDates || [];
    const targetDate = date || new Date().toISOString().split('T')[0];

    if (!completedDates.includes(targetDate)) {
      completedDates.push(targetDate);
    }

    const updated = await StudyPlan.findByIdAndUpdate(id, {
      completedDates,
      completed: true // Mark overall plan completed once at least one session is marked
    });

    res.json(updated);
  } catch (error) {
    console.error('Complete Study Session Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Delete study plan
 * @route DELETE /api/study-plans/:id
 * @access Private
 */
export const deleteStudyPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await StudyPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Study plan not found' });
    }

    if (plan.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await StudyPlan.findByIdAndDelete(id);
    res.json({ message: 'Study plan deleted successfully' });
  } catch (error) {
    console.error('Delete Study Plan Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
