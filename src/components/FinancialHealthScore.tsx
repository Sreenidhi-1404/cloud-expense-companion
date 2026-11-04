import React from 'react';
import { FinancialHealthScoreData } from '../types';
import { ShieldCheck, AlertTriangle, TrendingUp, Info } from 'lucide-react';

interface Props {
  data: FinancialHealthScoreData;
}

export const FinancialHealthScore: React.FC<Props> = ({ data }) => {
  const getStatusColor = (status: FinancialHealthScoreData['status']) => {
    switch (status) {
      case 'Excellent':
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400',
          ring: 'text-emerald-500',
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
        };
      case 'Good':
        return {
          bg: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800 dark:text-blue-400',
          ring: 'text-blue-500',
          badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
        };
      case 'Fair':
        return {
          bg: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800 dark:text-amber-400',
          ring: 'text-amber-500',
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
        };
      case 'Needs Attention':
        return {
          bg: 'bg-rose-500/10 text-rose-600 border-rose-200 dark:border-rose-800 dark:text-rose-400',
          ring: 'text-rose-500',
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
        };
    }
  };

  const style = getStatusColor(data.status);
  const strokeDashoffset = 283 - (283 * data.score) / 100;

  return (
    <div id="financial-health-score-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
      {/* Decorative ambient corner glow */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Financial Health Score
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Composite solvency & budget discipline score
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border ${style.badge} shadow-xs`}>
          {data.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Score Dial */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative my-2">
          {/* Subtle glow circle */}
          <div className="absolute w-28 h-28 rounded-full bg-emerald-500/5 blur-xl pointer-events-none" />
          
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="52"
              stroke="currentColor"
              strokeWidth="11"
              className="text-slate-100 dark:text-slate-800 fill-none"
            />
            <circle
              cx="80"
              cy="80"
              r="52"
              stroke="currentColor"
              strokeWidth="11"
              strokeDasharray="327"
              strokeDashoffset={327 - (327 * data.score) / 100}
              strokeLinecap="round"
              className={`${style.ring} fill-none transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {data.score}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Score / 100
            </span>
          </div>
        </div>

        {/* Details & Explanation */}
        <div className="md:col-span-7 space-y-3.5">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{data.explanation}</span>
          </div>

          <div className="space-y-2.5 pt-1 text-xs">
            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                <span>Budget Adherence</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">{data.budgetAdherenceScore}/40</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${(data.budgetAdherenceScore / 40) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1.5 font-medium">
                <span>Savings Progress</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">{data.savingsProgressScore}/30</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${(data.savingsProgressScore / 30) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
