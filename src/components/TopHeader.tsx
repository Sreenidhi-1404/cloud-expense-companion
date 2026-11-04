import React, { useState } from 'react';
import { User } from '../lib/auth';
import {
  Menu,
  Plus,
  Camera,
  Database,
  Moon,
  Sun,
  User as UserIcon,
  LogIn,
  LogOut,
  ChevronRight,
  Wallet,
  Bot
} from 'lucide-react';
import { NavView } from './Sidebar';

interface TopHeaderProps {
  activeView: NavView;
  onOpenMobileNav: () => void;
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenRecordExpense: () => void;
  onOpenImageAnalyzer: () => void;
  onOpenChatbot?: () => void;
  onOpenMongoStatus?: () => void;
  onOpenAdminDashboard?: () => void;
}

const VIEW_TITLES: Record<NavView, { title: string; subtitle: string }> = {
  overview: {
    title: 'Financial Overview',
    subtitle: 'Holistic summary of spending, budget status and insights'
  },
  transactions: {
    title: 'Transactions Ledger',
    subtitle: 'Filter, search, categorize, and manage all your expenses'
  },
  income: {
    title: 'Income Management',
    subtitle: 'Track salaries, freelance revenue, retainers and cash inflows'
  },
  insights: {
    title: 'AI Insights & Health',
    subtitle: 'Gemini-powered financial advice, predictions and carbon impact'
  },
  budgets: {
    title: 'Category Budgets',
    subtitle: 'Set and track spending limits across categories'
  },
  goals: {
    title: 'Savings Goals',
    subtitle: 'Monitor and celebrate milestones towards your financial dreams'
  },
  trends: {
    title: 'Daily Spending Trends',
    subtitle: 'Analyze your day-to-day spending pattern and budget trajectory'
  }
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeView,
  onOpenMobileNav,
  user,
  darkMode,
  onToggleDarkMode,
  onOpenAuth,
  onLogout,
  onOpenRecordExpense,
  onOpenMongoStatus,
  onOpenImageAnalyzer,
  onOpenChatbot,
  onOpenAdminDashboard
}) => {
  const [isRippling, setIsRippling] = useState(false);

  const handleToggleTheme = () => {
    setIsRippling(true);
    onToggleDarkMode();
    setTimeout(() => {
      setIsRippling(false);
    }, 600);
  };

  const currentViewMeta = VIEW_TITLES[activeView] || VIEW_TITLES.overview;

  return (
    <header
      id="main-top-header"
      className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors h-16"
    >
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Mobile Menu Trigger & Contextual Breadcrumbs */}
        <div className="flex items-center space-x-3">
          {/* Hamburger Menu on Mobile */}
          <button
            id="mobile-nav-toggle-btn"
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Open side navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumbs */}
          <div className="flex items-center space-x-2 text-xs">
            <div className="hidden sm:flex items-center text-slate-400 dark:text-slate-500 font-medium">
              <span>Workspace</span>
              <ChevronRight className="w-3.5 h-3.5 mx-1" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                {currentViewMeta.title}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Gemini Chatbot Shortcut */}
          {onOpenChatbot && (
            <button
              id="top-chatbot-btn"
              onClick={onOpenChatbot}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-xl transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800"
              title="Open Gemini Multi-Turn Financial Chatbot"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">AI Chat</span>
            </button>
          )}

          {/* Scan Receipt Shortcut */}
          <button
            id="top-scan-btn"
            onClick={onOpenImageAnalyzer}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 rounded-xl transition-all cursor-pointer border border-purple-200/80 dark:border-purple-800"
            title="Scan Receipt with Gemini"
          >
            <Camera className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span className="hidden md:inline">Scan Receipt</span>
          </button>

          {/* Quick Record Expense Button */}
          <button
            id="top-add-expense-btn"
            onClick={onOpenRecordExpense}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden xs:inline sm:inline">Add Expense</span>
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            id="top-theme-toggle-btn"
            type="button"
            onClick={handleToggleTheme}
            role="switch"
            aria-checked={darkMode}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`group relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300 ease-out cursor-pointer overflow-hidden active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 border ${
              darkMode
                ? 'bg-slate-800 text-sky-300 border-slate-700 shadow-[0_2px_10px_rgba(15,23,42,0.4)]'
                : 'bg-amber-50 text-amber-600 border-amber-200 shadow-[0_2px_10px_rgba(245,158,11,0.12)]'
            }`}
          >
            {isRippling && (
              <span
                className={`absolute inset-0 rounded-xl pointer-events-none animate-theme-ripple ${
                  darkMode ? 'bg-sky-400/30' : 'bg-amber-400/30'
                }`}
              />
            )}

            <div className="relative w-4 h-4 flex items-center justify-center pointer-events-none">
              <Sun
                className={`w-4 h-4 text-amber-500 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
                  darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <Moon
                className={`w-4 h-4 text-sky-300 absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
                  darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </div>
          </button>

          {/* Auth Button or User Mini Pill */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold cursor-default shadow-xs"
                title={`Signed in as ${user.email}`}
              >
                {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:inline max-w-[120px] truncate">
                {user.email ? user.email.split('@')[0] : 'User'}
              </span>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
