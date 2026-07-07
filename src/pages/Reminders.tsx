import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Bell, AlertTriangle, Check, Calendar, ClipboardList } from 'lucide-react';
import { api } from '../services/api';
import { Reminder, ReminderType } from '../types';

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ReminderType>('assignment');
  const [deadline, setDeadline] = useState('');
  const [subject, setSubject] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReminders = async () => {
    try {
      const data = await api.getReminders();
      setReminders(data);
    } catch (err: any) {
      console.error('Fetch reminders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !deadline || !subject) {
      setError('Please provide title, deadline date, and subject.');
      return;
    }

    try {
      await api.createReminder({
        title,
        type,
        deadline,
        subject
      });

      // Clear Form
      setTitle('');
      setType('assignment');
      setDeadline('');
      setSubject('');

      setSuccess('Reminder registered successfully!');
      fetchReminders();
    } catch (err: any) {
      setError(err.message || 'Failed to register reminder.');
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissReminder(id);
      fetchReminders();
    } catch (err: any) {
      setError(err.message || 'Failed to dismiss reminder.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteReminder(id);
      setSuccess('Reminder deleted successfully.');
      fetchReminders();
    } catch (err: any) {
      setError(err.message || 'Failed to delete reminder.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activeReminders = reminders.filter(r => !r.notified);
  const dismissedReminders = reminders.filter(r => r.notified);

  return (
    <div className="space-y-8 font-sans pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Assignment & Exam Reminders</h1>
        <p className="text-slate-500 text-sm">Organize crucial final dates. Register assignments, project milestones, or exam sheets to coordinate daily workloads ahead of schedule.</p>
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
        
        {/* Left Column: Form to create reminder */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" /> Register Exam or Assignment
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reminder Title</label>
                <input 
                  id="reminder-title-input"
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Finals Paper-1, DBMS Assignment 2 submission"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject or Topic</label>
                <input 
                  id="reminder-subject-input"
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Cryptography, Operating Systems"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Type</label>
                  <select 
                    id="reminder-type-select"
                    value={type}
                    onChange={(e) => setType(e.target.value as ReminderType)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="exam">Exam</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Deadline / Exam Date</label>
                  <input 
                    id="reminder-date-input"
                    type="date" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition"
                    required
                  />
                </div>
              </div>

              <button 
                id="reminder-submit-btn"
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition"
              >
                Create Alert Reminder
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active and history lists */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active reminders list */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-lg">Active Upcoming Deadlines ({activeReminders.length})</h3>
            
            {activeReminders.length > 0 ? (
              <div className="space-y-3">
                {activeReminders.map((rem) => {
                  const isExam = rem.type === 'exam';
                  return (
                    <div key={rem.id} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className={`p-3 rounded-xl flex-shrink-0 ${isExam ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase block">{rem.subject}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isExam ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {rem.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-800 text-base truncate">{rem.title}</h4>
                          <p className="text-xs text-rose-600 font-semibold flex items-center gap-1 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> Due: {rem.deadline}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          id={`dismiss-reminder-${rem.id}`}
                          onClick={() => handleDismiss(rem.id)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-2.5 rounded-xl transition"
                          title="Acknowledge Reminder"
                        >
                          <Check className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          id={`delete-reminder-${rem.id}`}
                          onClick={() => handleDelete(rem.id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-xl transition"
                          title="Delete Reminder"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-100 p-12 rounded-3xl text-center space-y-3">
                <div className="bg-slate-50 text-slate-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-700 text-lg">No Active Reminders</h4>
                <p className="text-slate-400 max-w-sm mx-auto text-sm">All set! No upcoming exam or coursework deadlines are registered right now.</p>
              </div>
            )}
          </div>

          {/* Dismissed reminders list */}
          {dismissedReminders.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="font-bold text-slate-500 text-sm uppercase tracking-wider">Completed / Dismissed ({dismissedReminders.length})</h3>
              <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100">
                {dismissedReminders.map((rem) => (
                  <div key={rem.id} className="p-4 flex items-center justify-between gap-4 bg-slate-50/50">
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-slate-400 line-through truncate">{rem.title}</h4>
                        <p className="text-xs text-slate-400">{rem.subject} • Completed on {rem.deadline}</p>
                      </div>
                    </div>
                    <button 
                      id={`delete-dismissed-${rem.id}`}
                      onClick={() => handleDelete(rem.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
