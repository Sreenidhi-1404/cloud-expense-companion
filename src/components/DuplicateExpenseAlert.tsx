import React from 'react';
import { DuplicateWarning } from '../types';
import { Copy, X, ArrowRight } from 'lucide-react';

interface Props {
  warning: DuplicateWarning;
  onContinue: () => void;
  onCancel: () => void;
}

export const DuplicateExpenseAlert: React.FC<Props> = ({ warning, onContinue, onCancel }) => {
  if (!warning.isDuplicate) return null;

  return (
    <div id="duplicate-expense-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Copy className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Similar Purchase Warning
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {warning.message}
            </p>
            {warning.matchedExpense && (
              <div className="mt-3 p-3 rounded-xl bg-blue-50/50 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {warning.matchedExpense.title}
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Category: {warning.matchedExpense.category}</span>
                  <span>Amount: ₹{warning.matchedExpense.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            id="duplicate-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="duplicate-continue-btn"
            onClick={onContinue}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Continue Anyway</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
