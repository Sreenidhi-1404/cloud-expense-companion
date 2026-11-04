import React, { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged, signOut, auth } from './lib/auth';
import { 
  Expense, 
  CategoryBudget, 
  SavingsGoal, 
  AIRecommendation,
  IncomeRecord
} from './types';
import { 
  getUserExpenses, 
  addExpense, 
  updateExpense, 
  deleteExpense,
  getUserBudgets,
  saveCategoryBudget,
  getUserSavingsGoals,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getUserIncomes,
  addIncome,
  updateIncome,
  deleteIncome,
  ensureUserDocument,
  onFirestoreSyncStatus,
  FirestoreSyncStatus
} from './services/expenseService';
import { 
  calculateFinancialHealthScore, 
  calculateCarbonImpact, 
  detectSubscriptions, 
  predictNextMonthExpenses 
} from './utils/financialCalculations';
import { generateAIBudgetRecommendations } from './services/geminiService';
import { generateStarterExpenses, generateStarterGoals } from './lib/sampleData';

import { Sidebar, NavView } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { FinancialHealthScore } from './components/FinancialHealthScore';
import { CarbonImpact } from './components/CarbonImpact';
import { SavingsGoals } from './components/SavingsGoals';
import { AIBudgetRecommendations } from './components/AIBudgetRecommendations';
import { ExpensePrediction } from './components/ExpensePrediction';
import { SubscriptionDetector } from './components/SubscriptionDetector';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseFormModal } from './components/ExpenseFormModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { AuthModal } from './components/AuthModal';
import { ReportExportModal } from './components/ReportExportModal';
import { MongoStatusModal } from './components/MongoStatusModal';
import { ImageAnalyzerModal } from './components/ImageAnalyzerModal';
import { DailySpendingTrendChart } from './components/DailySpendingTrendChart';
import { IncomeManagerModal } from './components/IncomeManagerModal';
import { AdminDashboard } from './components/AdminDashboard';
import { GeminiChatbotModal } from './components/GeminiChatbotModal';

import { 
  Plus, 
  TrendingDown, 
  Calendar, 
  Wallet, 
  PieChart, 
  DollarSign, 
  Sparkles, 
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Camera,
  Database,
  X,
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  Coffee,
  Fuel as FuelIcon,
  ShoppingBag,
  Car,
  Bot,
  ArrowDownLeft
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch {
      // fallback
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Data states
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // AI & UI Modals
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMongoModalOpen, setIsMongoModalOpen] = useState(false);
  const [isImageAnalyzerModalOpen, setIsImageAnalyzerModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [firestoreNotice, setFirestoreNotice] = useState<FirestoreSyncStatus | null>(null);

  // Subscribe to Firestore sync and permission events
  useEffect(() => {
    const unsubscribe = onFirestoreSyncStatus((status) => {
      if (status.isPermissionError) {
        setFirestoreNotice(status);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Dark Mode class and persist preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      try {
        localStorage.setItem('theme', 'dark');
      } catch {
        // ignore
      }
    } else {
      document.documentElement.classList.remove('dark');
      try {
        localStorage.setItem('theme', 'light');
      } catch {
        // ignore
      }
    }
  }, [darkMode]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      if (currentUser) {
        ensureUserDocument(currentUser.uid, currentUser.email, currentUser.displayName);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data whenever auth changes
  useEffect(() => {
    const loadData = async () => {
      const uId = user ? user.uid : null;
      const [exps, incs, bdgs, sGoals] = await Promise.all([
        getUserExpenses(uId),
        getUserIncomes(uId),
        getUserBudgets(uId),
        getUserSavingsGoals(uId)
      ]);

      setExpenses(exps);
      setIncomes(incs);
      setBudgets(bdgs);
      setSavingsGoals(sGoals);
    };
    loadData();
  }, [user]);

  // Compute calculated values
  const healthData = useMemo(() => {
    return calculateFinancialHealthScore(expenses, budgets, savingsGoals);
  }, [expenses, budgets, savingsGoals]);

  const carbonData = useMemo(() => {
    return calculateCarbonImpact(expenses);
  }, [expenses]);

  const subscriptions = useMemo(() => {
    return detectSubscriptions(expenses);
  }, [expenses]);

  const predictionData = useMemo(() => {
    return predictNextMonthExpenses(expenses);
  }, [expenses]);

  // Load AI Insights whenever expenses change or user requests refresh
  const handleFetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const recs = await generateAIBudgetRecommendations(expenses, budgets);
      setAiRecommendations(recs);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    handleFetchAiInsights();
  }, [expenses.length, budgets]);

  // Data Actions
  const handleSaveExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt' | 'userId'> | Expense) => {
    const uId = user ? user.uid : null;
    if ('id' in expenseData) {
      await updateExpense(uId, expenseData as Expense);
    } else {
      await addExpense(uId, expenseData);
    }
    const updated = await getUserExpenses(uId);
    setExpenses(updated);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const uId = user ? user.uid : null;
    await deleteExpense(uId, expenseId);
    const updated = await getUserExpenses(uId);
    setExpenses(updated);
  };

  const handleSaveBudget = async (budget: CategoryBudget) => {
    const uId = user ? user.uid : null;
    await saveCategoryBudget(uId, budget);
    const updated = await getUserBudgets(uId);
    setBudgets(updated);
  };

  const handleAddGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    const uId = user ? user.uid : null;
    await addSavingsGoal(uId, goal);
    const updated = await getUserSavingsGoals(uId);
    setSavingsGoals(updated);
  };

  const handleUpdateGoal = async (goal: SavingsGoal) => {
    const uId = user ? user.uid : null;
    await updateSavingsGoal(uId, goal);
    const updated = await getUserSavingsGoals(uId);
    setSavingsGoals(updated);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const uId = user ? user.uid : null;
    await deleteSavingsGoal(uId, goalId);
    const updated = await getUserSavingsGoals(uId);
    setSavingsGoals(updated);
  };

  const handleSaveIncome = async (incomeData: Omit<IncomeRecord, 'id' | 'createdAt' | 'userId'> | IncomeRecord) => {
    const uId = user ? user.uid : null;
    if ('id' in incomeData) {
      await updateIncome(uId, incomeData as IncomeRecord);
    } else {
      await addIncome(uId, incomeData);
    }
    const updated = await getUserIncomes(uId);
    setIncomes(updated);
  };

  const handleDeleteIncome = async (incomeId: string) => {
    const uId = user ? user.uid : null;
    await deleteIncome(uId, incomeId);
    const updated = await getUserIncomes(uId);
    setIncomes(updated);
  };

  const handleLoadSampleData = async () => {
    const uId = user ? user.uid : 'guest';
    const sampleExps = generateStarterExpenses(uId);
    const sampleGoals = generateStarterGoals(uId);
    for (const exp of sampleExps) {
      await addExpense(uId, exp);
    }
    for (const goal of sampleGoals) {
      await addSavingsGoal(uId, goal);
    }
    const [exps, sGoals] = await Promise.all([
      getUserExpenses(uId),
      getUserSavingsGoals(uId)
    ]);
    setExpenses(exps);
    setSavingsGoals(sGoals);
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // Summary Metrics
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const currentMonthIncomes = incomes.filter(i => i.date.startsWith(currentMonthPrefix));
  
  const totalSpentMonthly = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpentOverall = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomeMonthly = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const netSavingsMonthly = totalIncomeMonthly - totalSpentMonthly;

  // Category summary for budget status bar
  const categoryMonthlyTotals: Record<string, number> = {};
  currentMonthExpenses.forEach(e => {
    categoryMonthlyTotals[e.category] = (categoryMonthlyTotals[e.category] || 0) + e.amount;
  });

  // Calculate overspent categories for visual alert indicator on CTA buttons
  const overspentCategories = useMemo(() => {
    return budgets.filter(b => {
      const spent = categoryMonthlyTotals[b.category] || 0;
      return b.monthlyLimit > 0 && spent > b.monthlyLimit;
    });
  }, [categoryMonthlyTotals, budgets]);

  const isOverBudget = overspentCategories.length > 0;

  const totalMonthlyBudgetLimit = useMemo(() => {
    return budgets.reduce((acc, b) => acc + (b.monthlyLimit || 0), 0);
  }, [budgets]);

  // Side navigation & view state
  const [activeView, setActiveView] = useState<NavView>('overview');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'insights' | 'transactions'>('all');

  // Quick preset helper
  const handleAddPreset = async (title: string, amount: number, category: Expense['category']) => {
    const today = new Date().toISOString().split('T')[0];
    await handleSaveExpense({
      title,
      amount,
      category,
      date: today,
      description: 'Quick preset entry'
    });
  };

  // Smoothly toggle dark mode with transitional animation class on root document
  const handleToggleDarkMode = () => {
    document.documentElement.classList.add('theme-transitioning');
    setDarkMode(prev => !prev);
    window.setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 500);
  };

  // Category Budgets Card renderer
  const renderCategoryBudgetsSection = () => (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Category Budget Limits & Utilization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Current month progress against configured spending targets
          </p>
        </div>
        <button
          onClick={() => setIsBudgetModalOpen(true)}
          className="px-3.5 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-xl transition-all cursor-pointer border border-emerald-200 dark:border-emerald-800"
        >
          Configure Limits
        </button>
      </div>

      {budgets.filter(b => b.monthlyLimit > 0).length === 0 ? (
        <div className="text-center py-8 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <PieChart className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No monthly category limits set yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Set category limits to track overspending warnings and optimize your financial health score.</p>
          <button
            onClick={() => setIsBudgetModalOpen(true)}
            className="mt-3 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
          >
            Set Monthly Limits
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {budgets.filter(b => b.monthlyLimit > 0).map(b => {
            const spent = categoryMonthlyTotals[b.category] || 0;
            const pct = Math.min(100, Math.round((spent / b.monthlyLimit) * 100));
            const isOver = spent > b.monthlyLimit;

            return (
              <div key={b.category} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs">
                <div className="flex justify-between items-center text-xs mb-2 font-medium">
                  <span className="text-slate-900 dark:text-slate-100 font-bold">{b.category}</span>
                  <span className={`font-bold ${isOver ? 'text-rose-600 dark:text-rose-400' : pct > 80 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {pct}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-2.5">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span>Spent: ₹{spent.toLocaleString('en-IN')}</span>
                  <span>Cap: ₹{b.monthlyLimit.toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased flex">
      {/* Side Navigation Bar */}
      <Sidebar
        activeView={activeView}
        onSelectView={(v) => {
          setActiveView(v);
          if (v === 'overview') setActiveTab('all');
          else if (v === 'transactions') setActiveTab('transactions');
          else if (v === 'insights') setActiveTab('insights');
        }}
        user={user}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenRecordExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenBudgetManager={() => setIsBudgetModalOpen(true)}
        onOpenReportExport={() => setIsReportModalOpen(true)}
        onOpenMongoStatus={() => setIsMongoModalOpen(true)}
        onOpenImageAnalyzer={() => setIsImageAnalyzerModalOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        expenseCount={expenses.length}
        incomeCount={incomes.length}
        healthScore={healthData.score}
        isOverBudget={isOverBudget}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
      />

      {/* Main Workspace Area (offset by sidebar width on desktop) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen min-w-0">
        <TopHeader
          activeView={activeView}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          user={user}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenRecordExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenMongoStatus={() => setIsMongoModalOpen(true)}
          onOpenImageAnalyzer={() => setIsImageAnalyzerModalOpen(true)}
          onOpenChatbot={() => setIsChatbotOpen(true)}
          onOpenAdminDashboard={() => setIsAdminModalOpen(true)}
        />

        {/* Main Dashboard Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Sync Status Notice Banner */}
        {firestoreNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-100 block sm:inline">
                  Offline Mode Active:
                </span>{' '}
                <span className="text-amber-800 dark:text-amber-300">
                  Cloud sync is running in protected local cache mode. All expenses, budgets, and goals remain safely preserved.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => setFirestoreNotice(null)}
                className="p-1.5 rounded-lg text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
                title="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Overview Cockpit & Summary Cards */}
        {activeView === 'overview' && (
          <>
            {/* Top Header Banner & Primary Cockpit */}
            <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Subtle ambient gradient aura in cockpit background */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-full border border-emerald-200 dark:border-emerald-800/80 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Real-time Intelligence
                </span>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-md shadow-emerald-500/20 shrink-0">
                  {user?.email ? user.email.charAt(0).toUpperCase() : '₹'}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                    Welcome Back{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    AI-powered financial cockpit, budget optimizer & expense tracking companion.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                id="cockpit-open-chatbot-btn"
                onClick={() => setIsChatbotOpen(true)}
                className="group px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-2xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 cursor-pointer shadow-xs active:scale-95"
              >
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <span>Gemini Chat</span>
              </button>

              <button
                onClick={() => setIsImageAnalyzerModalOpen(true)}
                className="group px-3.5 py-2.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/80 rounded-2xl transition-all border border-purple-200 dark:border-purple-800 flex items-center space-x-2 cursor-pointer shadow-xs active:scale-95"
              >
                <div className="p-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                  <Camera className="w-3.5 h-3.5" />
                </div>
                <span>Scan Receipt</span>
              </button>

              <button
                onClick={() => setIsIncomeModalOpen(true)}
                className="group px-3.5 py-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 rounded-2xl transition-all border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 cursor-pointer shadow-xs active:scale-95"
                title="Manage income streams and cash inflow"
              >
                <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                </div>
                <span>Income Manager</span>
              </button>

              <button
                id="add-expense-primary-btn"
                onClick={() => {
                  setEditingExpense(null);
                  setIsExpenseModalOpen(true);
                }}
                className={`relative px-5 py-2.5 text-xs font-bold text-white rounded-2xl transition-all shadow-md flex items-center space-x-2 cursor-pointer active:scale-95 ${
                  isOverBudget
                    ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:from-rose-700 hover:to-amber-700 ring-2 ring-rose-500/50 shadow-rose-500/30 animate-pulse'
                    : 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5'
                }`}
                title={
                  isOverBudget
                    ? `Over budget in ${overspentCategories.map(c => c.category).join(', ')}!`
                    : 'Record new expense'
                }
              >
                {isOverBudget ? (
                  <AlertTriangle className="w-4 h-4 text-amber-200 animate-bounce" />
                ) : (
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>Record Expense</span>

                {isOverBudget && (
                  <span className="relative flex h-2 w-2 ml-1">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Preset Expense Chips */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <div className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span>1-Tap Quick Presets:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
              <button
                onClick={() => handleAddPreset('Coffee & Snack', 150, 'Food')}
                className="group px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 hover:border-emerald-300 dark:hover:border-emerald-800 cursor-pointer whitespace-nowrap flex items-center space-x-1.5 active:scale-95 shadow-xs"
              >
                <Coffee className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                <span>+ ₹150 Coffee</span>
              </button>

              <button
                onClick={() => handleAddPreset('Fuel Top-up', 500, 'Fuel')}
                className="group px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-400 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-800 cursor-pointer whitespace-nowrap flex items-center space-x-1.5 active:scale-95 shadow-xs"
              >
                <FuelIcon className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>+ ₹500 Fuel</span>
              </button>

              <button
                onClick={() => handleAddPreset('Grocery Essentials', 800, 'Food')}
                className="group px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-800 cursor-pointer whitespace-nowrap flex items-center space-x-1.5 active:scale-95 shadow-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
                <span>+ ₹800 Grocery</span>
              </button>

              <button
                onClick={() => handleAddPreset('Taxi / Auto Ride', 250, 'Travel')}
                className="group px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 hover:border-purple-300 dark:hover:border-purple-800 cursor-pointer whitespace-nowrap flex items-center space-x-1.5 active:scale-95 shadow-xs"
              >
                <Car className="w-3.5 h-3.5 text-purple-500 group-hover:scale-110 transition-transform" />
                <span>+ ₹250 Travel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation Segmented Control */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="inline-flex p-1.5 bg-slate-200/70 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
            <button
              onClick={() => {
                setActiveTab('all');
                setActiveView('overview');
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('insights');
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'insights'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>AI Insights & Health</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('transactions');
              }}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>Transactions</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {expenses.length}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Health: <strong className="text-slate-900 dark:text-slate-100">{healthData.score}/100</strong></span>
            </span>
          </div>
        </div>

        {/* Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1 */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider text-[11px]">
                  This Month's Spending
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
                  ₹{totalSpentMonthly.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                    {currentMonthExpenses.length} entries
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">current cycle</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all duration-300 group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-400" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider text-[11px]">
                  All-Time Cumulative
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
                  ₹{totalSpentOverall.toLocaleString('en-IN')}
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                    {expenses.length} records total
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">lifetime ledger</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-500/40 hover:shadow-md transition-all duration-300 group sm:col-span-2 lg:col-span-1">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-fuchsia-400" />
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1 uppercase tracking-wider text-[11px]">
                  Category Budgets
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight block">
                  {budgets.filter(b => b.monthlyLimit > 0).length} Set
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                    healthData.overspendingCount > 0
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                  }`}>
                    {healthData.overspendingCount > 0 ? `${healthData.overspendingCount} Over Cap` : 'All Within Limits'}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">monthly thresholds</span>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections based on Overview or Specific Active Tab */}
        {activeTab === 'all' && (
          <DailySpendingTrendChart
            expenses={expenses}
            monthlyBudgetTotal={totalMonthlyBudgetLimit}
          />
        )}

        {(activeTab === 'all' || activeTab === 'insights') && (
          <>
            {/* Health Score & AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <FinancialHealthScore data={healthData} />
              </div>
              <div className="lg:col-span-6">
                <AIBudgetRecommendations
                  recommendations={aiRecommendations}
                  loading={aiLoading}
                  onRefresh={handleFetchAiInsights}
                />
              </div>
            </div>

            {/* Savings Goals Tracker */}
            <SavingsGoals
              goals={savingsGoals}
              onAddGoal={handleAddGoal}
              onUpdateGoal={handleUpdateGoal}
              onDeleteGoal={handleDeleteGoal}
            />

            {/* Expense Prediction, Carbon Impact, Subscriptions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ExpensePrediction data={predictionData} />
              <CarbonImpact data={carbonData} />
              <SubscriptionDetector subscriptions={subscriptions} />
            </div>

            {/* Budget Status Overview Bar Card */}
            {renderCategoryBudgetsSection()}
          </>
        )}

        {(activeTab === 'all' || activeTab === 'transactions') && (
          <ExpenseList
            expenses={expenses}
            onEditExpense={exp => {
              setEditingExpense(exp);
              setIsExpenseModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onOpenAddModal={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
          />
        )}
      </>
    )}

    {/* Dedicated Views from Side Navigation */}
    {activeView === 'transactions' && (
      <div className="space-y-6">
        {/* Quick Presets Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="p-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>1-Tap Quick Presets:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-none">
            <button
              onClick={() => handleAddPreset('Coffee & Snack', 150, 'Food')}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 cursor-pointer whitespace-nowrap flex items-center space-x-1.5"
            >
              <Coffee className="w-3.5 h-3.5 text-amber-600" />
              <span>+ ₹150 Coffee</span>
            </button>
            <button
              onClick={() => handleAddPreset('Fuel Top-up', 500, 'Fuel')}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 cursor-pointer whitespace-nowrap flex items-center space-x-1.5"
            >
              <FuelIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>+ ₹500 Fuel</span>
            </button>
            <button
              onClick={() => handleAddPreset('Grocery Essentials', 800, 'Food')}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 cursor-pointer whitespace-nowrap flex items-center space-x-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-blue-500" />
              <span>+ ₹800 Grocery</span>
            </button>
            <button
              onClick={() => handleAddPreset('Taxi / Auto Ride', 250, 'Travel')}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800/90 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-200/50 dark:border-slate-700/60 cursor-pointer whitespace-nowrap flex items-center space-x-1.5"
            >
              <Car className="w-3.5 h-3.5 text-purple-500" />
              <span>+ ₹250 Travel</span>
            </button>
          </div>
        </div>

        <ExpenseList
          expenses={expenses}
          onEditExpense={exp => {
            setEditingExpense(exp);
            setIsExpenseModalOpen(true);
          }}
          onDeleteExpense={handleDeleteExpense}
          onOpenAddModal={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
        />
      </div>
    )}

    {activeView === 'insights' && (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <FinancialHealthScore data={healthData} />
          </div>
          <div className="lg:col-span-6">
            <AIBudgetRecommendations
              recommendations={aiRecommendations}
              loading={aiLoading}
              onRefresh={handleFetchAiInsights}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ExpensePrediction data={predictionData} />
          <CarbonImpact data={carbonData} />
          <SubscriptionDetector subscriptions={subscriptions} />
        </div>
      </div>
    )}

    {activeView === 'income' && (
      <div className="space-y-6">
        {/* Income Management Ledger View */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Income Streams & Inflows
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {incomes.length} Streams
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage your salaries, recurring retainers, investments, and business cash inflows
              </p>
            </div>

            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl transition-all shadow-md flex items-center space-x-2 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Income Stream</span>
            </button>
          </div>

          {/* Quick Cash Flow Highlight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
                Total Monthly Inflows
              </span>
              <span className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 block">
                ₹{totalIncomeMonthly.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Monthly Expenses
              </span>
              <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mt-1 block">
                ₹{totalSpentMonthly.toLocaleString('en-IN')}
              </span>
            </div>
            <div className={`p-4 rounded-2xl border ${
              netSavingsMonthly >= 0 
                ? 'bg-teal-50/60 dark:bg-teal-950/30 border-teal-200/80 dark:border-teal-800 text-teal-800 dark:text-teal-300'
                : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              <span className="text-[11px] font-semibold block">
                Net Monthly Cash Flow
              </span>
              <span className="text-2xl font-extrabold mt-1 block">
                {netSavingsMonthly >= 0 ? '+' : ''}₹{netSavingsMonthly.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Income Records List */}
          <div className="space-y-3">
            {incomes.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No income sources added yet</p>
                <p className="text-xs text-slate-400 mt-1">Add your primary salary or client retainers to compute monthly savings rates.</p>
                <button
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="mt-3 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer"
                >
                  Add Income Source
                </button>
              </div>
            ) : (
              incomes.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.source}
                      </strong>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        {item.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>{item.date}</span>
                      {item.description && <span>• {item.description}</span>}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      +₹{item.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => setIsIncomeModalOpen(true)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}

    {activeView === 'budgets' && (
      <div className="space-y-6">
        {renderCategoryBudgetsSection()}
      </div>
    )}

    {activeView === 'goals' && (
      <div className="space-y-6">
        <SavingsGoals
          goals={savingsGoals}
          onAddGoal={handleAddGoal}
          onUpdateGoal={handleUpdateGoal}
          onDeleteGoal={handleDeleteGoal}
        />
      </div>
    )}

    {activeView === 'trends' && (
      <div className="space-y-6">
        <DailySpendingTrendChart
          expenses={expenses}
          monthlyBudgetTotal={totalMonthlyBudgetLimit}
        />
      </div>
    )}
  </main>
</div>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        editingExpense={editingExpense}
        allExpenses={expenses}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />

      <IncomeManagerModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        incomes={incomes}
        onSaveIncome={handleSaveIncome}
        onDeleteIncome={handleDeleteIncome}
      />

      <BudgetManagerModal
        isOpen={isBudgetModalOpen}
        budgets={budgets}
        onClose={() => setIsBudgetModalOpen(false)}
        onSaveBudget={handleSaveBudget}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAdminSuccess={() => setIsAdminModalOpen(true)}
      />

      <ReportExportModal
        isOpen={isReportModalOpen}
        expenses={expenses}
        budgets={budgets}
        onClose={() => setIsReportModalOpen(false)}
      />

      <MongoStatusModal
        isOpen={isMongoModalOpen}
        onClose={() => setIsMongoModalOpen(false)}
      />

      <ImageAnalyzerModal
        isOpen={isImageAnalyzerModalOpen}
        onClose={() => setIsImageAnalyzerModalOpen(false)}
        onExpenseExtracted={async (extractedData) => {
          await handleSaveExpense(extractedData);
        }}
      />

      <AdminDashboard
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      <GeminiChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        expenses={expenses}
        budgets={budgets}
        savingsGoals={savingsGoals}
        healthScore={healthData.score}
      />

      {/* Floating Action Button: Quick Gemini Chatbot Trigger */}
      <button
        id="floating-gemini-chat-btn"
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex items-center space-x-2 group"
        title="Chat with Gemini Financial Advisor"
      >
        <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline font-bold text-xs pr-1">Ask Gemini</span>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
      </button>
    </div>
  );
}
