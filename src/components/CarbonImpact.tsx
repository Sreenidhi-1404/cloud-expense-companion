import React from 'react';
import { CarbonImpactData } from '../types';
import { Leaf, Info, Lightbulb, Fuel, Plane, ShoppingBag, Utensils } from 'lucide-react';

interface Props {
  data: CarbonImpactData;
}

export const CarbonImpact: React.FC<Props> = ({ data }) => {
  const getImpactBadge = (level: CarbonImpactData['impactLevel']) => {
    switch (level) {
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Very High':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
    }
  };

  return (
    <div id="carbon-impact-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Eco Impact
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estimated carbon footprint indicator
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-full border border-teal-200/50 dark:border-teal-800/50 ${getImpactBadge(data.impactLevel)}`}>
          {data.impactLevel} Impact
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Monthly Score Stat */}
        <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-slate-800/60 border border-teal-100/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Monthly Eco Score
            </span>
            <span className="text-2xl font-bold text-teal-700 dark:text-teal-300">
              {data.monthlyEcoScore} <span className="text-sm font-normal text-slate-500">/ 100</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
              Highest Contributor
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {data.topCategory}
            </span>
          </div>
        </div>

        {/* Breakdown bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
            <span>Category Contribution</span>
            <span>{data.categoryBreakdown.length} Active Categories</span>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {data.categoryBreakdown.map((item, idx) => {
              const colors = ['bg-teal-500', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-indigo-500'];
              return (
                <div
                  key={item.category}
                  className={`${colors[idx % colors.length]} transition-all duration-300`}
                  style={{ width: `${Math.max(5, item.percentage)}%` }}
                  title={`${item.category}: ${item.percentage}%`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Green suggestions */}
      {data.greenSuggestions.length > 0 && (
        <div className="mt-5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start space-x-2.5">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-slate-900 dark:text-slate-100 block mb-0.5">Green Suggestion:</strong>
            <span>{data.greenSuggestions[0]}</span>
          </div>
        </div>
      )}

      <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 italic flex items-center space-x-1">
        <Info className="w-3 h-3" />
        <span>Scores are estimated relative impact indicators based on spend categories, not scientifically exact CO2e measurements.</span>
      </div>
    </div>
  );
};
