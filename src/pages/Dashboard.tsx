import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, CheckSquare, Bell, Award, BookOpen, Clock, 
  TrendingUp, ArrowRight, Zap, RefreshCw, Check, Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { AppStats, Task, Reminder, AIRecommendation } from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<AppStats | null>(null);
  const [aiRec, setAiRec] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsData = await api.getReportStats();
      setStats(statsData);
      
      const latestAi = await api.getLatestAiRecommendation();
      setAiRec(latestAi);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGenerateAi = async () => {
    setAiLoading(true);
    setError('');
    try {
      const newRec = await api.generateAiRecommendations();
      setAiRec(newRec);
      // Refresh stats to include any updated productivity percentage/totals
      const statsData = await api.getReportStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to Gemini AI. Ensure you have added study plans.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await api.updateTask(task.id, { completed: true });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Find max weekly progress to scale SVG bar charts nicely
  const maxProgressVal = stats?.weeklyProgress.reduce((max, d) => {
    const total = d.tasksCompleted + d.studyHours;
    return total > max ? total : max;
  }, 10) || 10;

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Welcome banner & CTA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Personal Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back! Here is an overview of your academic focus and progress today.</p>
        </div>
        <button 
          id="trigger-ai-btn"
          onClick={handleGenerateAi}
          disabled={aiLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 text-sm"
        >
          {aiLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Workload...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" /> Get AI Coaching Advice
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Grid containing Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Pending Tasks</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.pendingTasksCount}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Habit Streak</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.habitStreak} days</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Study Plans</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.totalStudyHours}h total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 text-rose-600 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Productivity Rate</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.productivityPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Main split grid: AI Coach Recommendations and Weekly Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - AI Coach advice */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Sparkles design elements */}
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-48 h-48" />
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/20 text-indigo-200 px-3 py-1 rounded-full text-xs font-semibold w-max">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> AI ACADEMIC COACH
              </div>
              
              {aiRec ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-indigo-200 text-xs font-semibold tracking-wider uppercase">Focus Subject First:</span>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                      {aiRec.suggestedSubject} <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </h3>
                  </div>

                  <p className="text-indigo-100 text-sm leading-relaxed bg-indigo-950/40 p-4 rounded-xl border border-indigo-800/20">
                    {aiRec.recommendationReason}
                  </p>

                  <div className="space-y-2 pt-2">
                    <span className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">Top Study Tips:</span>
                    <ul className="space-y-1.5 text-sm text-indigo-100">
                      {aiRec.studyTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="bg-indigo-700 text-indigo-200 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">{idx + 1}</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {aiRec.productivityAlert && (
                    <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl text-xs space-y-1">
                      <span className="font-semibold uppercase tracking-wider block">Coaching Productivity Warning</span>
                      <p>{aiRec.productivityAlert}</p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button 
                      id="view-ai-timetable-btn"
                      onClick={() => onNavigate('reports')} 
                      className="bg-white text-indigo-950 hover:bg-slate-100 font-semibold text-xs px-4 py-2.5 rounded-lg transition flex items-center gap-1.5"
                    >
                      View AI Timetable <ArrowRight className="w-4 h-4" />
                    </button>
                    <button 
                      id="view-planner-btn"
                      onClick={() => onNavigate('study-planner')} 
                      className="text-indigo-200 hover:text-white font-semibold text-xs transition px-2"
                    >
                      Update Subject Plans
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 space-y-4 text-center">
                  <p className="text-indigo-200 text-sm">No AI recommendations generated yet. Submit your study plans and tasks to trigger full analysis!</p>
                  <button 
                    id="trigger-ai-onboarding-btn"
                    onClick={handleGenerateAi}
                    className="bg-white text-indigo-900 hover:bg-slate-100 font-semibold px-5 py-3 rounded-xl text-sm transition"
                  >
                    Generate AI Advice Now
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Today's Tasks block */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Today's Study Action Tasks</h3>
              <button 
                id="goto-tasks-btn"
                onClick={() => onNavigate('tasks')} 
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center gap-1 transition"
              >
                Manage Tasks <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {stats?.todayTasks && stats.todayTasks.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {stats.todayTasks.map((task) => (
                  <div key={task.id} className="py-3 flex justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                      <button 
                        id={`complete-task-${task.id}`}
                        onClick={() => handleCompleteTask(task)}
                        className="w-5 h-5 rounded border border-slate-300 hover:border-indigo-500 flex items-center justify-center transition hover:bg-slate-50"
                      >
                        <Check className="w-3.5 h-3.5 text-indigo-600 opacity-0 hover:opacity-100 transition" />
                      </button>
                      <div>
                        <span className="text-slate-800 font-medium text-sm block">{task.title}</span>
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{task.subject} • {task.priority} Priority</span>
                      </div>
                    </div>
                    <span className="bg-rose-50 text-rose-600 text-xs px-2.5 py-1 rounded-full font-semibold">Today</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm space-y-1">
                <p>No task assignments due today. Perfect time to study or rest!</p>
                <button 
                  id="add-task-onboarding-btn"
                  onClick={() => onNavigate('tasks')} 
                  className="text-indigo-600 hover:underline font-semibold text-xs"
                >
                  Create new study task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Reminders list and Weekly Progress chart */}
        <div className="lg:col-span-5 space-y-6">
          {/* Weekly chart */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Weekly Progress</h3>
              <p className="text-xs text-slate-400">Total study hours & tasks completed</p>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="w-full h-48 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-end flex-grow gap-2 h-36 pb-2">
                {stats?.weeklyProgress.map((p, idx) => {
                  const barHeight = Math.max(8, Math.round(((p.studyHours + p.tasksCompleted) / maxProgressVal) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
                      <div className="w-full flex flex-col gap-0.5 justify-end h-full">
                        {/* Tasks Completed Segment (Green) */}
                        {p.tasksCompleted > 0 && (
                          <div 
                            style={{ height: `${Math.round((p.tasksCompleted / maxProgressVal) * 100)}%` }}
                            className="bg-emerald-500 rounded-t-sm w-full transition-all duration-300"
                            title={`${p.tasksCompleted} tasks completed`}
                          ></div>
                        )}
                        {/* Study Hours Segment (Indigo) */}
                        <div 
                          style={{ height: `${Math.round((p.studyHours / maxProgressVal) * 100)}%` }}
                          className="bg-indigo-600 rounded-sm w-full transition-all duration-300"
                          title={`${p.studyHours} hours studied`}
                        ></div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{p.day}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] font-medium border-t border-slate-100 pt-1 text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span> Study Hours
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span> Tasks Completed
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Reminders */}
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">Upcoming Exams & Work</h3>
              <button 
                id="goto-reminders-btn"
                onClick={() => onNavigate('reminders')} 
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs flex items-center gap-1 transition"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {stats?.upcomingReminders && stats.upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingReminders.map((rem) => {
                  const isExam = rem.type === 'exam';
                  return (
                    <div key={rem.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-3">
                      <div className={`p-2 rounded-lg flex-shrink-0 ${isExam ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{rem.type} • {rem.subject}</span>
                        <h4 className="font-bold text-sm text-slate-800 truncate">{rem.title}</h4>
                        <p className="text-xs text-slate-500">Due: {rem.deadline}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm space-y-1">
                <p>No upcoming exam or assignment deadlines.</p>
                <button 
                  id="add-reminder-onboarding-btn"
                  onClick={() => onNavigate('reminders')} 
                  className="text-indigo-600 hover:underline font-semibold text-xs"
                >
                  Create a study reminder
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
