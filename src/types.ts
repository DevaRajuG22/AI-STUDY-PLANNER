/**
 * Shared Type Definitions for the AI-Powered Study Planner
 */

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface StudyPlan {
  id: string;
  userId: string;
  subject: string;
  studyHours: number;
  priority: Priority;
  studyDates: string[]; // e.g., ["2026-07-07", "2026-07-08"]
  completed: boolean;
  completedDates: string[]; // dates when a session was finished
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  subject: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  completedDates: string[]; // Array of "YYYY-MM-DD"
  streak: number;
  lastCompletedDate?: string; // "YYYY-MM-DD"
  createdAt: string;
  updatedAt: string;
}

export type ReminderType = 'assignment' | 'exam';

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  type: ReminderType;
  deadline: string; // ISO date/time or YYYY-MM-DD
  subject: string;
  notified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntry {
  day: string;
  subject: string;
  timeSlot: string;
  duration: string;
  breakTime: string;
}

export interface AIRecommendation {
  id: string;
  userId: string;
  generatedAt: string;
  timetable: TimetableEntry[];
  suggestedSubject: string;
  recommendationReason: string;
  breakTimingsTip: string;
  studyTips: string[];
  productivityAlert?: string; // alert if weekly completion is low
  createdAt: string;
  updatedAt: string;
}

export interface AppStats {
  todayTasks: Task[];
  upcomingReminders: Reminder[];
  habitStreak: number;
  completedTasksCount: number;
  pendingTasksCount: number;
  totalStudyHours: number;
  productivityPercentage: number;
  weeklyProgress: {
    day: string; // e.g., Mon, Tue
    tasksCompleted: number;
    studyHours: number;
  }[];
}
