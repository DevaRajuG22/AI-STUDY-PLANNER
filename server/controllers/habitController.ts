import { Response } from 'express';
import { Habit } from '../config/db';
import { AuthRequest } from '../middleware/auth';

/**
 * Helper to calculate current active daily streak from list of completed dates (YYYY-MM-DD)
 */
function calculateStreak(completedDates: string[]): number {
  if (!completedDates || completedDates.length === 0) return 0;

  // Deduplicate and sort dates descending (most recent first)
  const sortedDates = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a));
  
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const mostRecent = sortedDates[0];

  // If most recent completion is neither today nor yesterday, streak is broken
  if (mostRecent !== todayStr && mostRecent !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentDate = new Date(mostRecent);

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDateStr = sortedDates[i];
    const expectedPrevDate = new Date(currentDate);
    expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
    const expectedPrevDateStr = expectedPrevDate.toISOString().split('T')[0];

    if (prevDateStr === expectedPrevDateStr) {
      streak++;
      currentDate = new Date(prevDateStr);
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

/**
 * @desc Get all habits for a user
 * @route GET /api/habits
 * @access Private
 */
export const getHabits = async (req: AuthRequest, res: Response) => {
  try {
    const habits = await Habit.find({ userId: req.user!.id });
    
    // Recalculate streak dynamically just in case dates changed
    const updatedHabits = habits.map(h => {
      const currentStreak = calculateStreak(h.completedDates);
      return {
        ...h,
        streak: currentStreak
      };
    });

    res.json(updatedHabits);
  } catch (error) {
    console.error('Get Habits Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Create a habit
 * @route POST /api/habits
 * @access Private
 */
export const createHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide habit name' });
    }

    const newHabit = await Habit.create({
      userId: req.user!.id,
      name,
      completedDates: [],
      streak: 0
    });

    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Create Habit Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Toggle completion of habit for today
 * @route POST /api/habits/:id/toggle
 * @access Private
 */
export const toggleHabitCompletion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { date } = req.body; // custom date if needed, defaults to today
    
    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const targetDate = date || new Date().toISOString().split('T')[0];
    let completedDates = [...(habit.completedDates || [])];

    const dateIndex = completedDates.indexOf(targetDate);
    if (dateIndex > -1) {
      // Already completed on this day, so remove it (toggle off)
      completedDates.splice(dateIndex, 1);
    } else {
      // Not completed, add it (toggle on)
      completedDates.push(targetDate);
    }

    const streak = calculateStreak(completedDates);

    const updated = await Habit.findByIdAndUpdate(id, {
      completedDates,
      streak,
      lastCompletedDate: completedDates.length > 0 ? completedDates.sort().reverse()[0] : undefined
    });

    res.json(updated);
  } catch (error) {
    console.error('Toggle Habit Completion Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Delete a habit
 * @route DELETE /api/habits/:id
 * @access Private
 */
export const deleteHabit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findById(id);
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    if (habit.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Habit.findByIdAndDelete(id);
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete Habit Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
