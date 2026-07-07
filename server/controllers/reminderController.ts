import { Response } from 'express';
import { Reminder } from '../config/db';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc Get all reminders for a user
 * @route GET /api/reminders
 * @access Private
 */
export const getReminders = async (req: AuthRequest, res: Response) => {
  try {
    const reminders = await Reminder.find({ userId: req.user!.id });
    res.json(reminders);
  } catch (error) {
    console.error('Get Reminders Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Create a reminder (exam/assignment)
 * @route POST /api/reminders
 * @access Private
 */
export const createReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, deadline, subject } = req.body;

    if (!title || !type || !deadline || !subject) {
      return res.status(400).json({ message: 'Please provide title, type (exam/assignment), deadline, and subject' });
    }

    if (type !== 'assignment' && type !== 'exam') {
      return res.status(400).json({ message: 'Type must be "assignment" or "exam"' });
    }

    const newReminder = await Reminder.create({
      userId: req.user!.id,
      title,
      type,
      deadline,
      subject,
      notified: false
    });

    res.status(201).json(newReminder);
  } catch (error) {
    console.error('Create Reminder Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Mark reminder as notified
 * @route POST /api/reminders/:id/dismiss
 * @access Private
 */
export const dismissReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await Reminder.findByIdAndUpdate(id, {
      notified: true
    });

    res.json(updated);
  } catch (error) {
    console.error('Dismiss Reminder Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Delete a reminder
 * @route DELETE /api/reminders/:id
 * @access Private
 */
export const deleteReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const reminder = await Reminder.findById(id);
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    if (reminder.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Reminder.findByIdAndDelete(id);
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete Reminder Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
