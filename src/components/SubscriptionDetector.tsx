import React from 'react';
import { SubscriptionItem } from '../types';
import { Repeat, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

interface Props {
  subscriptions: SubscriptionItem[];
}

export const SubscriptionDetector: React.FC<Props> = ({ subscriptions }) => {
  const totalMonthlyCost = subscriptions.reduce((sum, s) => sum + s.monthlyCost, 0);
  const totalAnnualCost = subscriptions.reduce((sum, s) => sum + s.estimatedAnnualCost, 0);

  return (
    <div id="subscription-detector-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-orange-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Repeat className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Subscription Leak Detector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recurring payments & membership radar
            </p>
          </div>
        </div>

        <span className="px-3 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60">
          {subscriptions.length} Detected
        </span>
      </div>

      {subscriptions.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
          <span>No hidden recurring subscription leaks detected in recent transactions.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Annual Summary banner */}
          <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-slate-800/80 border border-orange-100/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                Total Monthly Subscriptions
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                ₹{totalMonthlyCost.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/mo</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                Estimated Annual Impact
              </span>
              <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                ₹{totalAnnualCost.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/yr</span>
              </span>
            </div>
          </div>

          {/* Subscriptions List */}
          <div className="space-y-2">
            {subscriptions.map(sub => (
              <div 
                key={sub.id} 
                className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center space-x-1.5">
                    <span>{sub.title}</span>
                    <span className="px-1.5 py-0.5 text-[10px] rounded bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {sub.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    Possible recurring expense • Last seen {sub.lastDate}
                  </span>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    ₹{sub.monthlyCost.toLocaleString('en-IN')}<span className="text-[10px] font-normal text-slate-500">/mo</span>
                  </div>
                  <div className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                    ~₹{sub.estimatedAnnualCost.toLocaleString('en-IN')}/yr
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
