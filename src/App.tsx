import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { StudyPlanner } from './pages/StudyPlanner';
import { Tasks } from './pages/Tasks';
import { Habits } from './pages/Habits';
import { Reminders } from './pages/Reminders';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { 
  BookOpen, LayoutDashboard, Calendar, CheckSquare, 
  Award, Bell, Sparkles, User, LogOut, Menu, X 
} from 'lucide-react';

const StudyPlannerAppShell: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If page is an internal authenticated view and they aren't logged in, redirect
  const activePage = isAuthenticated 
    ? (currentPage === 'home' || currentPage === 'login' || currentPage === 'register' ? 'dashboard' : currentPage)
    : (['home', 'login', 'register'].includes(currentPage) ? currentPage : 'home');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'study-planner', label: 'Study Planner', icon: Calendar },
    { id: 'tasks', label: 'Study Tasks', icon: CheckSquare },
    { id: 'habits', label: 'Habit Tracker', icon: Award },
    { id: 'reminders', label: 'Reminders', icon: Bell },
    { id: 'reports', label: 'AI Progress Reports', icon: Sparkles },
    { id: 'profile', label: 'Profile & Goals', icon: User },
  ];

  const handleNavigate = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'study-planner':
        return <StudyPlanner />;
      case 'tasks':
        return <Tasks />;
      case 'habits':
        return <Habits />;
      case 'reminders':
        return <Reminders />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  // If public guest layout (Home, Login, Register)
  if (!isAuthenticated && ['home', 'login', 'register'].includes(activePage)) {
    return <div className="min-h-screen bg-slate-50">{renderActivePage()}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-150 p-6 space-y-8 flex-shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-100">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">AI Study Planner</span>
        </div>

        <nav className="flex-grow space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="border-t border-slate-100 pt-4 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="bg-slate-100 text-slate-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
            <div className="min-w-0 flex-grow">
              <h5 className="font-bold text-sm text-slate-800 truncate">{user?.name || 'Active Student'}</h5>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'student@college.edu'}</p>
            </div>
          </div>
          <button
            id="sidebar-logout-btn"
            onClick={() => {
              logout();
              handleNavigate('home');
            }}
            className="w-full bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-500 font-bold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center space-x-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Navbar */}
      <header className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 text-white p-2 rounded-lg">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-bold text-base tracking-tight text-slate-800">AI Planner</span>
        </div>
        <button 
          id="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-600 focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-slate-900/40 z-10 pt-16 flex justify-end">
          <div className="bg-white w-64 h-full p-6 space-y-6 shadow-2xl flex flex-col justify-between">
            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-link-${item.id}`}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <button
                id="mobile-logout-btn"
                onClick={() => {
                  logout();
                  handleNavigate('home');
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2.5 rounded-xl text-xs transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      <main className="flex-grow p-6 md:p-10 max-h-screen overflow-y-auto w-full">
        {renderActivePage()}
      </main>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <StudyPlannerAppShell />
    </AuthProvider>
  );
}
