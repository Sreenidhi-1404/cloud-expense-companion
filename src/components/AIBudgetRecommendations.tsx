import React from 'react';
import { AIRecommendation } from '../types';
import { Sparkles, TrendingUp, AlertTriangle, ArrowDownRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface Props {
  recommendations: AIRecommendation | null;
  loading: boolean;
  onRefresh: () => void;
}

export const AIBudgetRecommendations: React.FC<Props> = ({ recommendations, loading, onRefresh }) => {
  return (
    <div id="ai-insights-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5 tracking-tight">
              <span>AI Insights & Recommendations</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalized budget analysis based on actual spending
            </p>
          </div>
        </div>

        <button
          id="refresh-ai-insights-btn"
          onClick={onRefresh}
          disabled={loading}
          className="p-2.5 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
          title="Refresh Insights"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center space-y-2">
          <Sparkles className="w-6 h-6 text-purple-500 animate-bounce" />
          <span className="text-xs text-slate-500 dark:text-slate-400">Analyzing transactions and generating AI insights...</span>
        </div>
      ) : !recommendations ? (
        <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
          Click refresh to generate initial AI budget recommendations.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Trend & Reduction Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-slate-800/80 border border-purple-100/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 block mb-1 flex items-center space-x-1">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                <span>Spending Trend</span>
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {recommendations.trendSummary}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-slate-800/80 border border-emerald-100/80 dark:border-slate-800">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 block mb-1 flex items-center space-x-1">
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                <span>Suggested Action</span>
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {recommendations.suggestedReduction}
              </p>
            </div>
          </div>

          {/* Budget Status Alerts */}
          {recommendations.budgetStatusAlerts.length > 0 && (
            <div className="space-y-1.5">
              {recommendations.budgetStatusAlerts.map((alert, i) => (
                <div 
                  key={i} 
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-2 py-0.5 rounded-md font-medium">
              AI-Generated Insights
            </span>
            <span>Estimated Savings Potential: <strong className="text-emerald-600 dark:text-emerald-400">₹{recommendations.potentialSavings.toLocaleString('en-IN')}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
