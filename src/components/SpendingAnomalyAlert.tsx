import React from 'react';
import { AnomalyWarning } from '../types';
import { AlertTriangle, X, Check } from 'lucide-react';

interface Props {
  warning: AnomalyWarning;
  onContinue: () => void;
  onCancel: () => void;
}

export const SpendingAnomalyAlert: React.FC<Props> = ({ warning, onContinue, onCancel }) => {
  if (!warning.isAnomaly) return null;

  return (
    <div id="spending-anomaly-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 max-w-md w-full shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Unusual Spending Detected
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              {warning.message}
            </p>
            <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex justify-between">
              <span>Category Avg: <strong className="text-slate-700 dark:text-slate-200">₹{warning.categoryAverage.toLocaleString('en-IN')}</strong></span>
              <span>New Expense: <strong className="text-amber-600 dark:text-amber-400">₹{warning.newAmount.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            id="anomaly-cancel-btn"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            id="anomaly-continue-btn"
            onClick={onContinue}
            className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
