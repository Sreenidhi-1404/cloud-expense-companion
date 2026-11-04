import React from 'react';
import { Expense, CategoryBudget } from '../types';
import { X, FileText, Download, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  expenses: Expense[];
  budgets: CategoryBudget[];
  onClose: () => void;
}

export const ReportExportModal: React.FC<Props> = ({ isOpen, expenses, budgets, onClose }) => {
  if (!isOpen) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Category totals
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="report-export-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Financial Report Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Detailed statement & category distribution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="space-y-4 print:p-0">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Total Logged Transactions</span>
              <strong className="text-base text-slate-900 dark:text-slate-100">{expenses.length} Records</strong>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Total Spending</span>
              <strong className="text-base text-emerald-600 dark:text-emerald-400">₹{totalSpent.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
              Category Summary
            </h4>
            <div className="space-y-2">
              {Object.entries(categoryTotals).map(([cat, amt]) => {
                const pct = Math.round((amt / (totalSpent || 1)) * 100);
                return (
                  <div key={cat} className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{cat}</span>
                    <div className="text-right">
                      <strong className="text-slate-900 dark:text-slate-100">₹{amt.toLocaleString('en-IN')}</strong>
                      <span className="text-[10px] text-slate-400 ml-2">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 dark:bg-slate-700 rounded-xl cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
