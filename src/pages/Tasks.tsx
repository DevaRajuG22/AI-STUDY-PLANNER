import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle, Circle, Plus, Trash2, Search, Filter,
  CheckSquare, Calendar, ChevronDown, Check
} from 'lucide-react';
import { api } from '../services/api';
import { Task, Priority } from '../types';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  // Filters
  const [filterPriority, setFilterPriority] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks({
        priority: filterPriority || undefined,
        subject: filterSubject || undefined,
        search: searchTerm || undefined
      });
      setTasks(data);
    } catch (err: any) {
      console.error('Fetch tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterPriority, filterSubject, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !subject || !dueDate) {
      setError('Please provide title, subject, and due date.');
      return;
    }

    try {
      await api.createTask({
        title,
        subject,
        priority,
        dueDate
      });
      
      // Clear Form
      setTitle('');
      setSubject('');
      setPriority('medium');
      setDueDate('');

      setSuccess('Task added successfully!');
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to create task.');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await api.updateTask(task.id, { completed: !task.completed });
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to update task.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteTask(id);
      setSuccess('Task deleted successfully.');
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to delete task.');
    }
  };

  // Get distinct subjects for filter dropdown
  const uniqueSubjects = [...new Set(tasks.map(t => t.subject))].filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Assignment & Task Management</h1>
        <p className="text-slate-500 text-sm">Create detailed, priority-based study lists, track course-work targets, and query assignments efficiently.</p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form to add task */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" /> Create New Study Task
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Task Title</label>
                <input 
                  id="task-title-input"
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Study Graph Algorithms, Draft DBMS project proposal"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
                <input 
                  id="task-subject-input"
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Computer Science, Mathematics"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</label>
                  <select 
                    id="task-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</label>
                  <input 
                    id="task-date-input"
                    type="date" 
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition"
                    required
                  />
                </div>
              </div>

              <button 
                id="task-submit-btn"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition"
              >
                Add Study Task
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Search, Filter & List of Tasks */}
        <div className="lg:col-span-7 space-y-6">
          {/* Filters card */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input 
                id="task-search-input"
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search study tasks..."
                className="w-full pl-9 pr-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition"
              />
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <select 
                id="task-filter-priority-select"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full pl-9 pr-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 text-sm text-slate-800 outline-none transition appearance-none"
              >
                <option value="">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div className="relative">
              <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <select 
                id="task-filter-subject-select"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full pl-9 pr-3 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl py-2.5 text-sm text-slate-800 outline-none transition appearance-none"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks List */}
          {tasks.length > 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
              {tasks.map((task) => {
                const priorityColors = {
                  low: 'bg-slate-100 text-slate-600',
                  medium: 'bg-amber-100 text-amber-800',
                  high: 'bg-rose-100 text-rose-800'
                };

                return (
                  <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-4 min-w-0">
                      <button 
                        id={`toggle-task-${task.id}`}
                        onClick={() => handleToggleComplete(task)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition flex-shrink-0 ${
                          task.completed 
                            ? 'bg-indigo-600 border-indigo-600 text-white' 
                            : 'border-slate-300 hover:border-indigo-500'
                        }`}
                      >
                        {task.completed && <Check className="w-4 h-4" />}
                      </button>
                      <div className="min-w-0">
                        <span className={`text-slate-800 font-bold text-sm block truncate ${task.completed ? 'line-through text-slate-400' : ''}`}>
                          {task.title}
                        </span>
                        <div className="flex items-center gap-2 pt-0.5 text-xs text-slate-400 font-semibold tracking-wide uppercase">
                          <span>{task.subject}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>{task.priority}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Due Date</span>
                        <span className="text-sm font-medium text-slate-700">{task.dueDate}</span>
                      </div>
                      <button 
                        id={`delete-task-${task.id}`}
                        onClick={() => handleDelete(task.id)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition flex-shrink-0"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center space-y-3 shadow-sm">
              <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <CheckSquare className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-lg">No Study Tasks Found</h4>
              <p className="text-slate-400 max-w-sm mx-auto text-sm">Either you are fully caught up, or your filters didn't match anything. Add some tasks to stay on track!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
