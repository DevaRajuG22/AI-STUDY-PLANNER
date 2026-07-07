import { User, StudyPlan, Task, Habit, Reminder, AIRecommendation, AppStats } from '../types';

const BASE_URL = '/api';

/**
 * Custom fetch wrapper to handle authorization headers, error responses, and parsing
 */
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('study_planner_token');
  
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // --- AUTHENTICATION ---
  register: (data: any) => 
    apiRequest<{ id: string; name: string; email: string; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: any) => 
    apiRequest<{ id: string; name: string; email: string; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getProfile: () => 
    apiRequest<User>('/auth/me'),

  // --- STUDY PLANNER ---
  getStudyPlans: () => 
    apiRequest<StudyPlan[]>('/study-plans'),

  createStudyPlan: (data: Partial<StudyPlan>) => 
    apiRequest<StudyPlan>('/study-plans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateStudyPlan: (id: string, data: Partial<StudyPlan>) => 
    apiRequest<StudyPlan>(`/study-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  completeStudySession: (id: string, date?: string) => 
    apiRequest<StudyPlan>(`/study-plans/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ date })
    }),

  deleteStudyPlan: (id: string) => 
    apiRequest<{ message: string }>(`/study-plans/${id}`, {
      method: 'DELETE'
    }),

  // --- TASK MANAGEMENT ---
  getTasks: (filters: { priority?: string; subject?: string; search?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.subject) params.append('subject', filters.subject);
    if (filters.search) params.append('search', filters.search);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<Task[]>(`/tasks${query}`);
  },

  createTask: (data: Partial<Task>) => 
    apiRequest<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateTask: (id: string, data: Partial<Task>) => 
    apiRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteTask: (id: string) => 
    apiRequest<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE'
    }),

  // --- HABIT TRACKER ---
  getHabits: () => 
    apiRequest<Habit[]>('/habits'),

  createHabit: (data: { name: string }) => 
    apiRequest<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  toggleHabit: (id: string, date?: string) => 
    apiRequest<Habit>(`/habits/${id}/toggle`, {
      method: 'POST',
      body: JSON.stringify({ date })
    }),

  deleteHabit: (id: string) => 
    apiRequest<{ message: string }>(`/habits/${id}`, {
      method: 'DELETE'
    }),

  // --- REMINDER SYSTEM ---
  getReminders: () => 
    apiRequest<Reminder[]>('/reminders'),

  createReminder: (data: Partial<Reminder>) => 
    apiRequest<Reminder>('/reminders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  dismissReminder: (id: string) => 
    apiRequest<Reminder>(`/reminders/${id}/dismiss`, {
      method: 'POST'
    }),

  deleteReminder: (id: string) => 
    apiRequest<{ message: string }>(`/reminders/${id}`, {
      method: 'DELETE'
    }),

  // --- AI RECOMMENDATIONS ---
  generateAiRecommendations: () => 
    apiRequest<AIRecommendation>('/ai/recommend', {
      method: 'POST'
    }),

  getLatestAiRecommendation: () => 
    apiRequest<AIRecommendation | null>('/ai/recommend/latest'),

  // --- REPORT STATISTICS ---
  getReportStats: () => 
    apiRequest<AppStats>('/reports/stats')
};
