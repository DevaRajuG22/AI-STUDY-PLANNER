import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Plus, Trash2, Calendar, CheckCircle2, 
  Clock, AlertTriangle, ArrowRight, BookMarked
} from 'lucide-react';
import { api } from '../services/api';
import { StudyPlan, Priority } from '../types';

export const StudyPlanner: React.FC = () => {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [subject, setSubject] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [studyDate, setStudyDate] = useState('');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPlans = async () => {
    try {
      const data = await api.getStudyPlans();
      setPlans(data);
    } catch (err: any) {
      console.error('Fetch plans error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleAddDate = () => {
    if (!studyDate) return;
    if (!selectedDates.includes(studyDate)) {
      setSelectedDates([...selectedDates, studyDate]);
    }
    setStudyDate('');
  };

  const handleRemoveDate = (dateToRemove: string) => {
    setSelectedDates(selectedDates.filter(d => d !== dateToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!subject || !studyHours) {
      setError('Please provide subject and target study hours.');
      return;
    }

    if (selectedDates.length === 0 && !studyDate) {
      setError('Please select or add at least one study date.');
      return;
    }

    const finalDates = [...selectedDates];
    if (studyDate && !finalDates.includes(studyDate)) {
      finalDates.push(studyDate);
    }

    try {
      await api.createStudyPlan({
        subject,
        studyHours: Number(studyHours),
        priority,
        studyDates: finalDates
      });

      // Clear Form
      setSubject('');
      setStudyHours('');
      setPriority('medium');
      setSelectedDates([]);
      setStudyDate('');
      
      setSuccess('Study plan created successfully!');
      fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to create study plan.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteStudyPlan(id);
      setSuccess('Study plan deleted successfully!');
      fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to delete study plan.');
    }
  };

  const handleCompleteSession = async (id: string) => {
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await api.completeStudySession(id, todayStr);
      setSuccess('Great job! Study session logged.');
      fetchPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to update study session.');
    }
  };

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
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Academic Study Planner</h1>
        <p className="text-slate-500 text-sm">Add courses, configure daily study workloads, and log completed sessions to optimize study outcomes.</p>
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
        {/* Left Column: Form to create study plan */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-indigo-600" /> Create New Course Plan
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject or Course Name</label>
                <input 
                  id="plan-subject-input"
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Computer Networks, Calculus"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Study Goal (Hours)</label>
                  <input 
                    id="plan-hours-input"
                    type="number" 
                    value={studyHours}
                    onChange={(e) => setStudyHours(e.target.value)}
                    placeholder="e.g., 10"
                    min="1"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority Level</label>
                  <select 
                    id="plan-priority-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Add Study Dates</label>
                <div className="flex gap-2">
                  <input 
                    id="plan-date-input"
                    type="date" 
                    value={studyDate}
                    onChange={(e) => setStudyDate(e.target.value)}
                    className="flex-grow bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition"
                  />
                  <button 
                    id="add-date-btn"
                    type="button"
                    onClick={handleAddDate}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold px-4 rounded-xl transition"
                  >
                    Add
                  </button>
                </div>

                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {selectedDates.map((date) => (
                      <span 
                        key={date} 
                        className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 font-medium border border-slate-200"
                      >
                        {date}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveDate(date)}
                          className="text-slate-400 hover:text-slate-600 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button 
                id="plan-submit-btn"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition"
              >
                Create Study Plan
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List of study plans */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Your Active Study Subjects ({plans.length})</h3>

          {plans.length > 0 ? (
            <div className="space-y-4">
              {plans.map((plan) => {
                const priorityColors = {
                  low: 'bg-slate-100 text-slate-600 border-slate-200',
                  medium: 'bg-amber-50 text-amber-700 border-amber-100',
                  high: 'bg-rose-50 text-rose-700 border-rose-100'
                };

                return (
                  <div key={plan.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex gap-2 items-center">
                          <h4 className="font-bold text-lg text-slate-800">{plan.subject}</h4>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${priorityColors[plan.priority]}`}>
                            {plan.priority}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 pt-1">Planned Sessions: {plan.studyDates?.join(', ') || 'No dates chosen'}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          id={`complete-session-${plan.id}`}
                          onClick={() => handleCompleteSession(plan.id)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2 rounded-xl transition"
                          title="Log standard study session complete today"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                        <button 
                          id={`delete-plan-${plan.id}`}
                          onClick={() => handleDelete(plan.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition"
                          title="Delete Subject Plan"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress tracking bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-indigo-500" /> Target Hours: {plan.studyHours}h</span>
                        <span>Sessions Logged: {plan.completedDates?.length || 0} completed</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, Math.round(((plan.completedDates?.length || 0) / (plan.studyDates?.length || 1)) * 100))}%` }}
                          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center space-y-3">
              <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-lg">No Study Plans Set</h4>
              <p className="text-slate-400 max-w-sm mx-auto text-sm">Add your college classes or subjects to generate daily study timetables and get custom tips!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
