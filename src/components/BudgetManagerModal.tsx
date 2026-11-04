import React, { useState } from 'react';
import { CategoryBudget, ExpenseCategory } from '../types';
import { X, Save, PieChart } from 'lucide-react';

interface Props {
  isOpen: boolean;
  budgets: CategoryBudget[];
  onClose: () => void;
  onSaveBudget: (budget: CategoryBudget) => Promise<void>;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Entertainment',
  'Fuel',
  'Flight',
  'Public Transport',
  'Education',
  'Subscriptions',
  'Others'
];

export const BudgetManagerModal: React.FC<Props> = ({
  isOpen,
  budgets,
  onClose,
  onSaveBudget
}) => {
  if (!isOpen) return null;

  const getLimit = (cat: ExpenseCategory) => {
    const found = budgets.find(b => b.category === cat);
    return found ? found.monthlyLimit : 0;
  };

  const handleUpdate = async (cat: ExpenseCategory, valStr: string) => {
    const val = parseFloat(valStr) || 0;
    await onSaveBudget({ category: cat, monthlyLimit: val });
  };

  return (
    <div id="budget-manager-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto relative">
        <div className="sticky -top-6 -mt-1 pt-1 pb-4 bg-white dark:bg-slate-900 z-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Monthly Category Budgets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set monthly spending limits for alerts & health scores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {CATEGORIES.map(cat => {
            const currentLimit = getLimit(cat);
            return (
              <div 
                key={cat} 
                className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100 w-1/3">
                  {cat}
                </span>

                <div className="flex items-center space-x-2 w-2/3">
                  <span className="text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="No limit set"
                    defaultValue={currentLimit || ''}
                    onBlur={e => handleUpdate(cat, e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 hover:shadow-emerald-500/25"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
