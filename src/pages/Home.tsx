import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, CheckCircle2, TrendingUp, Calendar, Bell } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex justify-between items-center shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-slate-900">AI Study Planner</span>
        </div>
        <div className="flex space-x-4">
          <button 
            id="nav-login-btn"
            onClick={() => onNavigate('login')}
            className="text-slate-600 hover:text-indigo-600 font-medium transition px-4 py-2"
          >
            Log In
          </button>
          <button 
            id="nav-register-btn"
            onClick={() => onNavigate('register')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Body */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16 flex-grow flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium"
          >
            <Sparkles className="w-4 h-4" /> AI-Powered Academic Success
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-none"
          >
            Supercharge Your Studies with <span className="text-indigo-600">Smart Schedules</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed max-w-xl"
          >
            Organize daily tasks, track study habits, set homework reminders, and get customized study timetables recommended instantly by Gemini AI.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex gap-4 pt-4"
          >
            <button 
              id="hero-get-started-btn"
              onClick={() => onNavigate('register')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition flex items-center gap-2"
            >
              Get Started Free <Sparkles className="w-5 h-5" />
            </button>
            <button 
              id="hero-login-btn"
              onClick={() => onNavigate('login')}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-8 py-4 rounded-xl transition"
            >
              Learn More
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex-1 bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden max-w-lg mx-auto"
        >
          {/* Dashboard Preview Mockup */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-400"></span>
              <span className="w-3 h-3 rounded-full bg-amber-400"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
            </div>
            <span className="text-xs font-mono text-slate-400">DEMO PROFILE</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center bg-indigo-50/50 border border-indigo-50 p-4 rounded-2xl">
              <div className="flex gap-3 items-center">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">AI Suggested Plan</h4>
                  <p className="text-xs text-slate-500">Focus on Algorithms first (high priority)</p>
                </div>
              </div>
              <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">90 min</span>
            </div>

            <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>TODAY'S WORKLOAD</span>
                <span>67% DONE</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 w-2/3 h-full rounded-full"></div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Complete DBMS Lab assignment
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Study Algorithms for 2 hours
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 line-through">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 fill-indigo-100" /> Complete discrete math notes
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="bg-white border-t border-slate-100 py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Everything you need to excel</h2>
            <p className="text-slate-600">Built as a perfect showcase of the full MERN stack integration for final-year submission.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition duration-300 space-y-4">
              <div className="bg-indigo-100 text-indigo-700 w-12 h-12 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Study Planner</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Map subjects, prioritize tasks, and structure complete study dates easily.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition duration-300 space-y-4">
              <div className="bg-emerald-100 text-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Habit Streaks</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Track routines dynamically and maintain study streaks with smart statistics.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition duration-300 space-y-4">
              <div className="bg-rose-100 text-rose-700 w-12 h-12 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Alert Reminders</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Never miss deadlines with structured reminders for exam papers and assignments.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition duration-300 space-y-4">
              <div className="bg-amber-100 text-amber-700 w-12 h-12 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">Gemini Coach</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Get personalized timetables, optimal study tips, and low-productivity warnings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 md:px-12 text-center text-sm border-t border-slate-800">
        <p>&copy; {new Date().getFullYear()} AI Study Planner College Capstone Project. Built with React, Express, and Google Gemini AI.</p>
      </footer>
    </div>
  );
};
