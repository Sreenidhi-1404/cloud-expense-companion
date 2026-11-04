import React from 'react';
import { ExpensePredictionData } from '../types';
import { LineChart, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface Props {
  data: ExpensePredictionData;
}

export const ExpensePrediction: React.FC<Props> = ({ data }) => {
  const getTrendIcon = () => {
    switch (data.trendDirection) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-rose-500" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-emerald-500" />;
      default:
        return <Minus className="w-4 h-4 text-blue-500" />;
    }
  };

  const points = [...data.previousMonths];
  // Add predicted month to chart if available
  if (points.length > 0) {
    const lastMonthName = points[points.length - 1].month;
    points.push({
      month: `${lastMonthName}+1`,
      totalSpent: data.predictedNextMonthSpent,
      isPredicted: true
    });
  }

  const maxVal = Math.max(1, ...points.map(p => p.totalSpent));

  return (
    <div id="expense-prediction-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-sky-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Expense Prediction
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spending trend & next month forecast
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700">
          {getTrendIcon()}
          <span className="capitalize">{data.trendDirection}</span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-sky-50/50 dark:bg-slate-800/60 border border-sky-100/80 dark:border-slate-800 mb-5">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Estimated Next Month Spending
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-semibold">
            Estimate
          </span>
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          ₹{data.predictedNextMonthSpent.toLocaleString('en-IN')}
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {data.explanation}
        </p>
      </div>

      {/* Visual Trend Chart */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
          Monthly Comparison
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {points.map((pt, i) => {
            const heightPct = Math.max(12, Math.round((pt.totalSpent / maxVal) * 100));
            return (
              <div 
                key={i} 
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  pt.isPredicted 
                    ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800' 
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>{pt.month}</span>
                  {pt.isPredicted && <span className="text-[9px] text-sky-600 dark:text-sky-400 font-semibold">EST</span>}
                </div>

                <div className="my-2 h-12 flex items-end">
                  <div 
                    className={`w-full rounded-md transition-all duration-500 ${
                      pt.isPredicted ? 'bg-sky-500/80 dark:bg-sky-400/80' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>

                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ₹{pt.totalSpent.toLocaleString('en-IN')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 italic flex items-center space-x-1">
        <Info className="w-3 h-3" />
        <span>Predictions are calculated using transparent weighted moving trends from historical transaction records.</span>
      </div>
    </div>
  );
};
