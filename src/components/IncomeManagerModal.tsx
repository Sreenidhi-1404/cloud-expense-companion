import React, { useState } from 'react';
import { IncomeRecord, IncomeCategory } from '../types';
import { 
  X, 
  Plus, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  DollarSign, 
  Briefcase, 
  Layers,
  ArrowDownLeft
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  incomes: IncomeRecord[];
  onSaveIncome: (income: Omit<IncomeRecord, 'id' | 'createdAt' | 'userId'> | IncomeRecord) => Promise<void>;
  onDeleteIncome: (id: string) => Promise<void>;
}

const CATEGORIES: IncomeCategory[] = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Rental',
  'Bonus',
  'Other'
];

export const IncomeManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  incomes,
  onSaveIncome,
  onDeleteIncome
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [source, setSource] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState<IncomeCategory>('Salary');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalMonthlyIncome = incomes.reduce((sum, item) => sum + item.amount, 0);

  const handleStartAdd = () => {
    setEditingId(null);
    setSource('');
    setAmount('');
    setCategory('Salary');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setIsEditing(true);
  };

  const handleStartEdit = (item: IncomeRecord) => {
    setEditingId(item.id);
    setSource(item.source);
    setAmount(item.amount);
    setCategory(item.category);
    setDate(item.date);
    setDescription(item.description || '');
    setIsEditing(true);
  };

  const handleCancelForm = () => {
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      if (editingId) {
        const existing = incomes.find(i => i.id === editingId);
        if (existing) {
          await onSaveIncome({
            ...existing,
            source,
            amount: Number(amount),
            category,
            date,
            description
          });
        }
      } else {
        await onSaveIncome({
          source,
          amount: Number(amount),
          category,
          date,
          description
        });
      }
      setIsEditing(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving income:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="income-manager-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Income Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track revenue, salaries, client retainers, and cash inflows
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Banner */}
        <div className="my-4 grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 block">
              Total Inflows Tracked
            </span>
            <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 block">
              ₹{totalMonthlyIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                Active Sources
              </span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 block">
                {incomes.length} Streams
              </span>
            </div>
            {!isEditing && (
              <button
                onClick={handleStartAdd}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Income</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit or Add Form */}
        {isEditing && (
          <form onSubmit={handleSubmit} className="mb-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {editingId ? 'Edit Income Entry' : 'Log New Income Stream'}
              </span>
              <button
                type="button"
                onClick={handleCancelForm}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Source / Client Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Salary, Acme Corp"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="50000"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IncomeCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Description / Memo (Optional)
              </label>
              <input
                type="text"
                placeholder="Optional payment notes or transaction reference"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancelForm}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs flex items-center space-x-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingId ? 'Update Income' : 'Save Income'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Incomes List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {incomes.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <ArrowDownLeft className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No income streams logged yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Add your monthly salary or client invoices to track savings rate.</p>
              {!isEditing && (
                <button
                  onClick={handleStartAdd}
                  className="mt-3 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                >
                  Add First Income
                </button>
              )}
            </div>
          ) : (
            incomes.map(item => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-2">
                    <strong className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.source}
                    </strong>
                    <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                    <span>{item.date}</span>
                    {item.description && <span>• {item.description}</span>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    +₹{item.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteIncome(item.id)}
                    className="p-1 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
