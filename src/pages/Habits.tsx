import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Award, CheckCircle2, TrendingUp, Calendar, Check } from 'lucide-react';
import { api } from '../services/api';
import { Habit } from '../types';

export const Habits: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchHabits = async () => {
    try {
      const data = await api.getHabits();
      setHabits(data);
    } catch (err: any) {
      console.error('Fetch habits error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name) {
      setError('Please provide habit name.');
      return;
    }

    try {
      await api.createHabit({ name });
      setName('');
      setSuccess('Habit tracked successfully!');
      fetchHabits();
    } catch (err: any) {
      setError(err.message || 'Failed to create habit.');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleHabit(id);
      fetchHabits();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle completion.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteHabit(id);
      setSuccess('Habit deleted successfully.');
      fetchHabits();
    } catch (err: any) {
      setError(err.message || 'Failed to delete habit.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to generate last 7 days strings for habit calendar grids
  const getLast7Days = () => {
    const list = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      list.push({
        dateStr,
        dayName: days[d.getDay()],
        dayNum: d.getDate()
      });
    }
    return list;
  };

  const last7Days = getLast7Days();

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
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Routine & Habit Tracking</h1>
        <p className="text-slate-500 text-sm">Build consistency with daily study rituals. Track streak metrics and tick active routines to build high-performance study patterns.</p>
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
        
        {/* Left Column: Form to create habits */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-600" /> Start a New Study Habit
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Habit Routine Name</label>
                <input 
                  id="habit-name-input"
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Read textbook for 30m, Review math flashcards"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition"
                  required
                />
              </div>

              <button 
                id="habit-submit-btn"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition"
              >
                Start Habit Tracker
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List of habits & streaks */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-bold text-slate-800 text-lg">Your Active Daily Routines ({habits.length})</h3>

          {habits.length > 0 ? (
            <div className="space-y-4">
              {habits.map((habit) => {
                const isCompletedToday = habit.completedDates?.includes(todayStr);

                return (
                  <div key={habit.id} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">{habit.name}</h4>
                        <span className="text-xs font-semibold text-slate-400 block pt-0.5 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Current streak: {habit.streak} days
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          id={`toggle-habit-${habit.id}`}
                          onClick={() => handleToggle(habit.id)}
                          className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                            isCompletedToday 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white border-transparent'
                          }`}
                        >
                          {isCompletedToday ? (
                            <>
                              <Check className="w-4 h-4" /> Completed Today
                            </>
                          ) : (
                            'Mark Done Today'
                          )}
                        </button>
                        <button 
                          id={`delete-habit-${habit.id}`}
                          onClick={() => handleDelete(habit.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-xl transition"
                          title="Delete Habit"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>

                    {/* Last 7 Days Habit Grid */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Last 7 Days Progress</span>
                      <div className="grid grid-cols-7 gap-2 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                        {last7Days.map((day) => {
                          const completedOnDay = habit.completedDates?.includes(day.dateStr);
                          return (
                            <div key={day.dateStr} className="text-center space-y-1">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase">{day.dayName}</span>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition border text-xs font-bold ${
                                completedOnDay 
                                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-100' 
                                  : 'bg-white border-slate-200 text-slate-500'
                              }`}>
                                {day.dayNum}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center space-y-3">
              <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-lg">No Daily Habits Tracked</h4>
              <p className="text-slate-400 max-w-sm mx-auto text-sm">Building habits is key to student success. Create a habit track such as "Read code notes" or "Sleep 8h" to begin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
