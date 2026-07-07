import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Calendar, BookOpen, Clock, TrendingUp, CheckCircle, 
  ChevronRight, RefreshCw, AlertCircle, Info, Bookmark
} from 'lucide-react';
import { api } from '../services/api';
import { AppStats, AIRecommendation, TimetableEntry } from '../types';

export const Reports: React.FC = () => {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchReportsData = async () => {
    try {
      const statsData = await api.getReportStats();
      setStats(statsData);

      const latestAi = await api.getLatestAiRecommendation();
      setAiRec(latestAi);
    } catch (err: any) {
      console.error('Error fetching reports stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleGenerateAi = async () => {
    setAiLoading(true);
    setError('');
    try {
      const newRec = await api.generateAiRecommendations();
      setAiRec(newRec);
      const statsData = await api.getReportStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Could not connect to Gemini. Add study plans first.');
    } finally {
      setAiLoading(false);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Academic Progress Reports</h1>
          <p className="text-slate-500 text-sm">Review consolidated daily, weekly, and monthly workloads. Access custom timetables suggested dynamically by Gemini AI.</p>
        </div>
        
        <button 
          id="report-rebuilt-ai-btn"
          onClick={handleGenerateAi}
          disabled={aiLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 text-sm"
        >
          {aiLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Regulating Scheduler...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" /> Re-Generate AI Timetable
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Grid: Study and habit stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Coursework Delivery</h4>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-slate-800">{stats?.completedTasksCount}</span>
            <span className="text-xs font-semibold text-emerald-600">Tasks Completed</span>
          </div>
          <p className="text-xs text-slate-400">Total homework deliverables completed. Keep track of pending tasks: {stats?.pendingTasksCount}.</p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Consistency Rating</h4>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-slate-800">{stats?.habitStreak} days</span>
            <span className="text-xs font-semibold text-emerald-600">Active Habit Streak</span>
          </div>
          <p className="text-xs text-slate-400">Longest consecutive routine completion. Excellent way to lock in study routines!</p>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Integrated Productivity</h4>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-extrabold text-slate-800">{stats?.productivityPercentage}%</span>
            <span className="text-xs font-semibold text-indigo-600">Total Score</span>
          </div>
          <p className="text-xs text-slate-400">Aggregated score weighting habits completed, study hours planned, and completed tasks.</p>
        </div>
      </div>

      {/* AI Timetable & Study Schedule */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> AI-Generated Study Timetable
            </h3>
            <p className="text-xs text-slate-400">Custom recommended schedules and break timings designed dynamically for your active subjects.</p>
          </div>
          {aiRec && (
            <span className="text-xs font-mono bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200">
              Generated: {new Date(aiRec.generatedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {aiRec ? (
          <div className="space-y-6">
            {/* The Timetable Grid */}
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <th className="p-4">Day</th>
                    <th className="p-4">Recommended Subject Focus</th>
                    <th className="p-4">Study Time Slot</th>
                    <th className="p-4">Target Duration</th>
                    <th className="p-4">Recommended Breaks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {aiRec.timetable.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-indigo-600">{entry.day}</td>
                      <td className="p-4 font-semibold text-slate-800">{entry.subject}</td>
                      <td className="p-4 font-mono text-xs">{entry.timeSlot}</td>
                      <td className="p-4"><span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full font-medium">{entry.duration}</span></td>
                      <td className="p-4"><span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">{entry.breakTime}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Coach's special advice panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-indigo-600" /> Cognitive Stamina & Breaks
                </h4>
                <p className="text-slate-600 text-sm leading-relaxed">{aiRec.breakTimingsTip}</p>
              </div>

              <div className="bg-indigo-50/50 border border-indigo-100/30 p-5 rounded-2xl space-y-2">
                <h4 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" /> Focus Subject Strategy
                </h4>
                <p className="text-indigo-800 text-sm leading-relaxed">{aiRec.recommendationReason}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center max-w-sm mx-auto space-y-4">
            <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700">No Timetable Generated</h4>
              <p className="text-slate-400 text-sm">Provide your active study planner subjects, and click the button to trigger full Gemini AI scheduling logic.</p>
            </div>
            <button 
              id="report-create-ai-btn"
              onClick={handleGenerateAi}
              disabled={aiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-sm"
            >
              Generate Custom AI Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
