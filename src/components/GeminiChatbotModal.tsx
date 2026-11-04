import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  Leaf, 
  Target, 
  User as UserIcon, 
  AlertCircle, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  RefreshCw,
  Compass,
  ArrowRight
} from 'lucide-react';
import { Expense, CategoryBudget, SavingsGoal } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  roleUsed?: string;
}

export type ChatbotRole = 'advisor' | 'enforcer' | 'sustainability' | 'planner';

interface RoleOption {
  id: ChatbotRole;
  name: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeBg: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'advisor',
    name: 'Financial Advisor',
    subtitle: 'Empathetic guidance, budgeting & smart money tips',
    icon: Sparkles,
    color: 'text-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  },
  {
    id: 'enforcer',
    name: 'Strict Enforcer',
    subtitle: 'Tough-love, zero excuses, stops impulse buys',
    icon: ShieldAlert,
    color: 'text-rose-500',
    badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800'
  },
  {
    id: 'sustainability',
    name: 'Eco & Carbon Guide',
    subtitle: 'Green spending choices & carbon reduction',
    icon: Leaf,
    color: 'text-teal-500',
    badgeBg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800'
  },
  {
    id: 'planner',
    name: 'Wealth Strategist',
    subtitle: 'Emergency funds, roadmaps & savings targets',
    icon: Target,
    color: 'text-purple-500',
    badgeBg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800'
  }
];

const SUGGESTED_QUESTIONS = [
  'Where am I spending the most money this month?',
  'How can I improve my Financial Health score?',
  'Can you suggest a realistic budget reduction plan?',
  'Which categories are currently over my limit?'
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  budgets: CategoryBudget[];
  savingsGoals: SavingsGoal[];
  healthScore: number;
}

export const GeminiChatbotModal: React.FC<Props> = ({
  isOpen,
  onClose,
  expenses,
  budgets,
  savingsGoals,
  healthScore
}) => {
  const [selectedRole, setSelectedRole] = useState<ChatbotRole>('advisor');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.1-flash-lite');
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Initial welcome message per role
  const getInitialMessage = (role: ChatbotRole): ChatMessage => {
    let greeting = 'Hello! I am your Gemini Financial Advisor. How can I help you analyze your spending, optimize budgets, or grow your savings today?';
    if (role === 'enforcer') {
      greeting = 'Attention! I am your Strict Budget Enforcer. Show me where your money is going so we can plug the leaks and eliminate unnecessary impulse spending.';
    } else if (role === 'sustainability') {
      greeting = 'Welcome! I am your Eco & Carbon Impact Specialist. Let us review your spending to lower both your carbon footprint and monthly costs.';
    } else if (role === 'planner') {
      greeting = 'Greetings! I am your Wealth & Goal Strategist. Let us build your emergency fund and craft a milestone roadmap for your financial goals.';
    }

    return {
      id: 'msg_welcome',
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel,
      roleUsed: role
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [getInitialMessage('advisor')]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // When role changes, add an announcement if no user chats yet
  const handleRoleChange = (newRole: ChatbotRole) => {
    setSelectedRole(newRole);
    if (messages.length <= 1) {
      setMessages([getInitialMessage(newRole)]);
    } else {
      // Append a role switch notification in thread
      const currentRoleObj = ROLES.find(r => r.id === newRole);
      setMessages(prev => [
        ...prev,
        {
          id: `role_switch_${Date.now()}`,
          role: 'assistant',
          content: `*Switched role to **${currentRoleObj?.name}***. Ready to assist with ${currentRoleObj?.subtitle.toLowerCase()}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          roleUsed: newRole,
          modelUsed: selectedModel
        }
      ]);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || loading) return;

    setError('');
    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInputPrompt('');
    setLoading(true);

    // Compute user context
    const now = new Date();
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
    const totalSpentMonthly = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
    const totalSpentOverall = expenses.reduce((s, e) => s + e.amount, 0);

    const categoryMonthlyTotals: Record<string, number> = {};
    currentMonthExpenses.forEach(e => {
      categoryMonthlyTotals[e.category] = (categoryMonthlyTotals[e.category] || 0) + e.amount;
    });

    const overspentList = budgets
      .filter(b => b.monthlyLimit > 0 && (categoryMonthlyTotals[b.category] || 0) > b.monthlyLimit)
      .map(b => `${b.category} (Spent: ₹${categoryMonthlyTotals[b.category]}, Limit: ₹${b.monthlyLimit})`);

    const goalsSummary = savingsGoals.map(g => `${g.name}: ₹${g.currentAmount} / ₹${g.targetAmount}`).join('; ');
    const recentExpensesSummary = expenses.slice(0, 5).map(e => `${e.title} (₹${e.amount}, ${e.category}, ${e.date})`).join('; ');

    const financialContext = {
      totalSpentMonthly,
      totalSpentOverall,
      budgetsCount: budgets.filter(b => b.monthlyLimit > 0).length,
      overspentCategories: overspentList,
      savingsGoalsSummary: goalsSummary || 'None active',
      healthScore,
      recentExpensesSummary: recentExpensesSummary || 'None'
    };

    try {
      const apiMessages = updatedHistory.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          role: selectedRole,
          model: selectedModel,
          financialContext
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive response from Gemini.');
      }

      const assistantMessage: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.model,
        roleUsed: data.role
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err?.message || 'Chat error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([getInitialMessage(selectedRole)]);
    setError('');
  };

  if (!isOpen) return null;

  const currentRoleMeta = ROLES.find(r => r.id === selectedRole) || ROLES[0];
  const RoleIcon = currentRoleMeta.icon;

  return (
    <div id="gemini-chatbot-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col transition-all duration-300 overflow-hidden ${
          isExpanded ? 'w-full h-full max-w-6xl max-h-[96vh]' : 'w-full max-w-2xl h-[86vh]'
        }`}
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                  Gemini Financial Chatbot
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800">
                  {selectedModel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Multi-turn AI advisor grounded in your live spending data
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Clear conversation history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand full-screen'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role & Model Selector Sub-Bar */}
        <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-950/40 flex flex-wrap items-center justify-between gap-2.5">
          {/* Role Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;

              return (
                <button
                  key={r.id}
                  onClick={() => handleRoleChange(r.id)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                  title={r.subtitle}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : r.color}`} />
                  <span>{r.name}</span>
                </button>
              );
            })}
          </div>

          {/* Model Switcher */}
          <div className="flex items-center space-x-1 text-xs shrink-0">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">Engine:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as any)}
              className="px-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium cursor-pointer focus:outline-hidden"
            >
              <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended)</option>
              <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
              <option value="gemini-4-argon">gemini-4-argon (Complex)</option>
            </select>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {messages.map((m) => {
            const isUser = m.role === 'user';

            return (
              <div
                key={m.id}
                className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                    isUser
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-3xl p-4 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 rounded-tl-xs'
                  }`}
                >
                  {/* Assistant Header Badge */}
                  {!isUser && (
                    <div className="flex items-center space-x-2 mb-2 pb-1.5 border-b border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">
                        {m.roleUsed ? ROLES.find(r => r.id === m.roleUsed)?.name : currentRoleMeta.name}
                      </span>
                      <span>•</span>
                      <span>{m.modelUsed || selectedModel}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                    </div>
                  )}

                  {/* Body Text */}
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {isUser && (
                    <div className="mt-1 text-right text-[10px] text-emerald-100">
                      {m.timestamp}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-start space-x-2.5">
              <div className="w-8 h-8 rounded-2xl bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-3.5 rounded-tl-xs flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 font-medium pl-1">Analyzing financial context...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        {messages.length <= 3 && !loading && (
          <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>Suggested Inquiries:</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-2.5 py-1 text-[11px] rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200/70 dark:border-slate-700/70 transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Input Field */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={`Ask ${currentRoleMeta.name} about your expenses, budgets, savings...`}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 rounded-2xl transition-all shadow-md cursor-pointer flex items-center space-x-1.5 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
