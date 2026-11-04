import React, { useState } from 'react';
import { User } from '../lib/auth';
import {
  LayoutDashboard,
  ReceiptText,
  Sparkles,
  PieChart,
  Target,
  TrendingDown,
  Plus,
  Camera,
  FileDown,
  Database,
  Moon,
  Sun,
  LogIn,
  LogOut,
  User as UserIcon,
  X,
  Wallet,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Bot,
  ArrowDownLeft,
  ShieldAlert
} from 'lucide-react';

export type NavView = 'overview' | 'transactions' | 'income' | 'budgets' | 'goals' | 'trends' | 'insights';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenRecordExpense: () => void;
  onOpenBudgetManager: () => void;
  onOpenReportExport: () => void;
  onOpenImageAnalyzer: () => void;
  onOpenChatbot: () => void;
  onOpenMongoStatus?: () => void;
  onLoadSampleData: () => void;
  expenseCount: number;
  incomeCount?: number;
  healthScore: number;
  isOverBudget: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenAdminDashboard: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  user,
  darkMode,
  onToggleDarkMode,
  onOpenAuth,
  onLogout,
  onOpenRecordExpense,
  onOpenBudgetManager,
  onOpenReportExport,
  onOpenImageAnalyzer,
  onOpenChatbot,
  onOpenMongoStatus,
  onLoadSampleData,
  expenseCount,
  incomeCount = 0,
  healthScore,
  isOverBudget,
  isOpenMobile,
  onCloseMobile,
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

  const navItems: Array<{
    id: NavView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
  }> = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard
    },
    {
      id: 'transactions',
      label: 'Expense Ledger',
      icon: ReceiptText,
      badge: expenseCount > 0 ? expenseCount : undefined,
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
    },
    {
      id: 'income',
      label: 'Income Streams',
      icon: ArrowDownLeft,
      badge: incomeCount > 0 ? incomeCount : undefined,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
    },
    {
      id: 'budgets',
      label: 'Budget Limits',
      icon: PieChart
    },
    {
      id: 'goals',
      label: 'Savings Goals',
      icon: Target
    },
    {
      id: 'trends',
      label: 'Trends & Predictions',
      icon: TrendingDown
    },
    {
      id: 'insights',
      label: 'AI & Health Score',
      icon: Sparkles,
      badge: `${healthScore}/100`,
      badgeColor: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
    }
  ];

  const handleNavClick = (viewId: NavView) => {
    onSelectView(viewId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity animate-in fade-in duration-200"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        id="side-navigation"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Side Navigation"
      >
        {/* Top: Brand Header & Primary Action */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            {/* Brand Logo & Wordmark */}
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <Wallet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-sm font-extrabold tracking-tight text-slate-900 dark:text-slate-100 block truncate">
                  Expense Companion
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block -mt-0.5 truncate">
                  Smart Financial Cockpit
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cloud Sync Status Indicator */}
          <div
            className="w-full mb-3.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Cloud Sync Active</span>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>

          {/* Primary CTA: Record Expense Button */}
          <button
            id="sidebar-record-expense-btn"
            onClick={() => {
              onOpenRecordExpense();
              onCloseMobile();
            }}
            className={`w-full py-2.5 px-3.5 text-xs font-bold rounded-2xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95 ${
              isOverBudget
                ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 text-white hover:from-rose-700 hover:to-amber-700 ring-2 ring-rose-500/40 shadow-rose-500/20'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20 hover:shadow-emerald-600/30'
            }`}
          >
            {isOverBudget ? (
              <AlertTriangle className="w-4 h-4 text-amber-200 animate-bounce" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>Record New Expense</span>
          </button>
        </div>

        {/* Center: Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin">
          {/* Main Navigation Views */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Workspace Views
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-2xl transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full font-mono tabular-nums ${
                          item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Smart AI & Intelligence Tools */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Intelligent Tools
            </div>
            <div className="space-y-1">
              {/* Gemini Multi-Turn AI Chatbot */}
              <button
                id="open-gemini-chatbot-btn"
                onClick={() => {
                  onOpenChatbot();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span>Gemini Chatbot</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                  AI Chat
                </span>
              </button>

              {/* Scan Receipt with Gemini */}
              <button
                id="open-image-analyzer-btn"
                onClick={() => {
                  onOpenImageAnalyzer();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span>Scan Receipt</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  OCR
                </span>
              </button>

              {/* Manage Category Budgets */}
              <button
                id="manage-budgets-nav-btn"
                onClick={() => {
                  onOpenBudgetManager();
                  onCloseMobile();
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
                  <PieChart className="w-4 h-4" />
                </div>
                <span>Configure Budgets</span>
              </button>

              {/* Export Reports */}
              <button
                id="export-reports-nav-btn"
                onClick={() => {
                  onOpenReportExport();
                  onCloseMobile();
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
                  <FileDown className="w-4 h-4" />
                </div>
                <span>Export CSV & Reports</span>
              </button>

              {/* Load Sample Demo Data */}
              <button
                id="load-starter-data-btn"
                onClick={() => {
                  onLoadSampleData();
                  onCloseMobile();
                }}
                className="w-full flex items-center space-x-3 px-3.5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>

          {/* Administration Section */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Administration
            </div>
            <div className="space-y-1">
              {/* Administrator Portal */}
              <button
                id="open-admin-portal-btn"
                onClick={() => {
                  onOpenAdminDashboard();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span>Administrator Portal</span>
                </div>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                  Secure
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer: Theme Switcher & User Account */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          {/* Theme Mode Toggle Row */}
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Interface Theme
            </span>

            <button
              id="theme-toggle-btn"
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
          </div>

          {/* User Account Bar */}
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                    {user.email ? user.email.split('@')[0] : 'Account'}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                    {user.email || 'Cloud User'}
                  </span>
                </div>
              </div>

              <button
                id="logout-btn"
                onClick={onLogout}
                className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="login-modal-open-btn"
              onClick={() => {
                onOpenAuth();
                onCloseMobile();
              }}
              className="w-full py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-colors shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Sync Data</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
