import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Mail, Calendar, BookOpen, ShieldAlert, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const [targetHours, setTargetHours] = useState('15');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('study_planner_target_hours', targetHours);
    setSuccess('Study goals updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Student Profile & Settings</h1>
        <p className="text-slate-500 text-sm">Review your college project identity details, configure default weekly targets, and manage your account.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-3 rounded-xl text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card: Account Summary */}
        <div className="lg:col-span-7 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <div className="bg-indigo-100 text-indigo-700 w-16 h-16 rounded-full flex items-center justify-center font-extrabold text-2xl">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-slate-800">{user?.name || 'Active Student'}</h3>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-4 h-4" /> {user?.email || 'student@college.edu'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-500 text-xs uppercase tracking-wider">Capstone Registration Identity</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Account Role</span>
                <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-500" /> College Scholar
                </span>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">Project Domain</span>
                <span className="text-sm font-bold text-slate-700">MERN & Gemini AI Sandbox</span>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              id="profile-logout-btn"
              onClick={handleLogout}
              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4.5 h-4.5" /> Sign Out of App
            </button>
          </div>
        </div>

        {/* Right Card: Core study parameters / goals */}
        <div className="lg:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-6">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" /> Weekly Targets
          </h3>

          <form onSubmit={handleSaveGoal} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Default Weekly Target Hours</label>
              <input 
                id="target-hours-input"
                type="number" 
                value={targetHours}
                onChange={(e) => setTargetHours(e.target.value)}
                placeholder="e.g., 15"
                min="1"
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl px-4 py-3 text-slate-800 outline-none transition"
                required
              />
            </div>

            <button 
              id="save-goal-btn"
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition"
            >
              Update Academic Goals
            </button>
          </form>

          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-500 space-y-2">
            <h5 className="font-bold text-slate-700 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Viva Tip</h5>
            <p>During the viva, explain how setting custom parameters (like weekly target hours) in local storage allows the student dashboard to calculate real productivity offsets dynamically!</p>
          </div>
        </div>

      </div>
    </div>
  );
};
