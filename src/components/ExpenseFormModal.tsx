import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, AnomalyWarning, DuplicateWarning } from '../types';
import { detectUnusualSpending, detectDuplicateExpense } from '../utils/financialCalculations';
import { SpendingAnomalyAlert } from './SpendingAnomalyAlert';
import { DuplicateExpenseAlert } from './DuplicateExpenseAlert';
import { PlusCircle, Save, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  editingExpense: Expense | null;
  allExpenses: Expense[];
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'userId'> | Expense) => Promise<void>;
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

export const ExpenseFormModal: React.FC<Props> = ({
  isOpen,
  editingExpense,
  allExpenses,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Warning check states
  const [anomalyWarning, setAnomalyWarning] = useState<AnomalyWarning | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateWarning | null>(null);

  const [bypassedAnomaly, setBypassedAnomaly] = useState(false);
  const [bypassedDuplicate, setBypassedDuplicate] = useState(false);

  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setDescription(editingExpense.description || '');
    } else {
      setTitle('');
      setAmount('');
      setCategory('Food');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setAnomalyWarning(null);
    setDuplicateWarning(null);
    setBypassedAnomaly(false);
    setBypassedDuplicate(false);
  }, [editingExpense, isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title || isNaN(numAmount) || numAmount <= 0 || !date) return;

    // Check Duplicate if not bypassed
    if (!editingExpense && !bypassedDuplicate) {
      const dup = detectDuplicateExpense(numAmount, category, title, allExpenses);
      if (dup.isDuplicate) {
        setDuplicateWarning(dup);
        return;
      }
    }

    // Check Anomaly if not bypassed
    if (!editingExpense && !bypassedAnomaly) {
      const anom = detectUnusualSpending(numAmount, category, allExpenses);
      if (anom.isAnomaly) {
        setAnomalyWarning(anom);
        return;
      }
    }

    // Save
    if (editingExpense) {
      await onSave({
        ...editingExpense,
        title,
        amount: numAmount,
        category,
        date,
        description
      });
    } else {
      await onSave({
        title,
        amount: numAmount,
        category,
        date,
        description
      });
    }

    onClose();
  };

  return (
    <>
      <div id="expense-form-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center space-x-2 tracking-tight">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <PlusCircle className="w-5 h-5" />
              </div>
              <span>{editingExpense ? 'Edit Expense Record' : 'Record New Expense'}</span>
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Expense Title / Merchant *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Lunch at Cafe, Gas Station, Flight Ticket"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="350"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Transaction Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description / Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Additional payment details, receipt number or notes..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center space-x-2 cursor-pointer active:scale-95 hover:shadow-emerald-500/25"
              >
                <Save className="w-4 h-4" />
                <span>{editingExpense ? 'Save Changes' : 'Save Expense'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Anomaly warning modal */}
      {anomalyWarning && (
        <SpendingAnomalyAlert
          warning={anomalyWarning}
          onCancel={() => setAnomalyWarning(null)}
          onContinue={() => {
            setAnomalyWarning(null);
            setBypassedAnomaly(true);
            // Re-trigger form submit
            const numAmount = parseFloat(amount);
            if (editingExpense) {
              onSave({
                ...editingExpense,
                title,
                amount: numAmount,
                category,
                date,
                description
              }).then(onClose);
            } else {
              onSave({
                title,
                amount: numAmount,
                category,
                date,
                description
              }).then(onClose);
            }
          }}
        />
      )}

      {/* Duplicate warning modal */}
      {duplicateWarning && (
        <DuplicateExpenseAlert
          warning={duplicateWarning}
          onCancel={() => setDuplicateWarning(null)}
          onContinue={() => {
            setDuplicateWarning(null);
            setBypassedDuplicate(true);
            // Re-trigger form submit
            const numAmount = parseFloat(amount);
            if (editingExpense) {
              onSave({
                ...editingExpense,
                title,
                amount: numAmount,
                category,
                date,
                description
              }).then(onClose);
            } else {
              onSave({
                title,
                amount: numAmount,
                category,
                date,
                description
              }).then(onClose);
            }
          }}
        />
      )}
    </>
  );
};
