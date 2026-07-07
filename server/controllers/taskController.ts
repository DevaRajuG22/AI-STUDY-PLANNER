import { Response } from 'express';
import { Task } from '../config/db';
import { AuthRequest } from '../middleware/auth';

/**
 * @desc Get all tasks for a user with search and filters
 * @route GET /api/tasks
 * @access Private
 */
export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const { priority, subject, search } = req.query;
    
    let tasks = await Task.find({ userId: req.user!.id });

    // Filter by priority
    if (priority) {
      tasks = tasks.filter(t => t.priority === priority);
    }

    // Filter by subject
    if (subject) {
      tasks = tasks.filter(t => t.subject.toLowerCase() === (subject as string).toLowerCase());
    }

    // Search tasks by title
    if (search) {
      const searchStr = (search as string).toLowerCase();
      tasks = tasks.filter(t => t.title.toLowerCase().includes(searchStr));
    }

    res.json(tasks);
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Create a task
 * @route POST /api/tasks
 * @access Private
 */
export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const { title, subject, priority, dueDate } = req.body;

    if (!title || !subject || !priority || !dueDate) {
      return res.status(400).json({ message: 'Please provide title, subject, priority, and dueDate' });
    }

    const newTask = await Task.create({
      userId: req.user!.id,
      title,
      subject,
      priority,
      dueDate,
      completed: false
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Update a task (including mark completed)
 * @route PUT /api/tasks/:id
 * @access Private
 */
export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, subject, priority, dueDate, completed } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updated = await Task.findByIdAndUpdate(id, {
      title: title !== undefined ? title : task.title,
      subject: subject !== undefined ? subject : task.subject,
      priority: priority !== undefined ? priority : task.priority,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      completed: completed !== undefined ? completed : task.completed,
    });

    res.json(updated);
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

/**
 * @desc Delete a task
 * @route DELETE /api/tasks/:id
 * @access Private
 */
export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.userId !== req.user!.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Task.findByIdAndDelete(id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete Task Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
