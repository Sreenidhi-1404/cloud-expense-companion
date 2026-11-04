import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { 
  Search, 
  Download, 
  Edit2, 
  Trash2, 
  Calendar, 
  ArrowUpDown, 
  Utensils, 
  Compass, 
  ShoppingBag, 
  Receipt, 
  Film, 
  Flame, 
  Plane, 
  Bus, 
  GraduationCap, 
  Repeat, 
  Tag, 
  X, 
  Plus, 
  SlidersHorizontal 
} from 'lucide-react';

interface Props {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenAddModal: () => void;
}

const CATEGORIES: string[] = [
  'All Categories',
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

export const ExpenseList: React.FC<Props> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        const matchesCategory = selectedCategory === 'All Categories' || e.category === selectedCategory;
        const matchesSearch = 
          e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.description && e.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });
  }, [expenses, selectedCategory, searchTerm, sortOrder]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const exportToCSV = () => {
    if (expenses.length === 0) return;
    const headers = ['ID', 'Title', 'Amount (INR)', 'Category', 'Date', 'Description'];
    const rows = filteredExpenses.map(e => [
      e.id,
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      e.category,
      e.date,
      `"${(e.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `expense_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case 'Food': return <Utensils className="w-3.5 h-3.5" />;
      case 'Travel': return <Compass className="w-3.5 h-3.5" />;
      case 'Shopping': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Bills': return <Receipt className="w-3.5 h-3.5" />;
      case 'Entertainment': return <Film className="w-3.5 h-3.5" />;
      case 'Fuel': return <Flame className="w-3.5 h-3.5" />;
      case 'Flight': return <Plane className="w-3.5 h-3.5" />;
      case 'Public Transport': return <Bus className="w-3.5 h-3.5" />;
      case 'Education': return <GraduationCap className="w-3.5 h-3.5" />;
      case 'Subscriptions': return <Repeat className="w-3.5 h-3.5" />;
      default: return <Tag className="w-3.5 h-3.5" />;
    }
  };

  const getCategoryColor = (category: ExpenseCategory) => {
    switch (category) {
      case 'Food': return 'bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/60';
      case 'Travel': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60';
      case 'Shopping': return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60';
      case 'Bills': return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60';
      case 'Fuel': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case 'Flight': return 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/60';
      case 'Subscriptions': return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60';
      default: return 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <div id="expense-history-section" className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-xs transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Expense History & Transactions
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredExpenses.length} logged
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time ledger with instant filtering, category tags, and CSV reporting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="export-csv-btn"
            onClick={exportToCSV}
            disabled={expenses.length === 0}
            className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Download CSV report of filtered expenses"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Quick Category Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 text-xs scrollbar-none">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Search & Sort Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, merchant or notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 text-slate-900 dark:text-slate-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="sm:col-span-4 flex items-center gap-2">
          <button
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            className="flex-1 px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200/60 dark:border-slate-700"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
          </button>
        </div>
      </div>

      {/* Active Filter & Total Pill */}
      <div className="flex flex-wrap items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span>Filtered: <strong className="text-slate-900 dark:text-slate-100">{filteredExpenses.length}</strong> items</span>
          {selectedCategory !== 'All Categories' && (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
              • Category: {selectedCategory}
            </span>
          )}
          {searchTerm && (
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
              • Query: "{searchTerm}"
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-semibold">
          <span className="text-slate-500 dark:text-slate-400 font-normal">Sum:</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold text-sm">
            ₹{totalFilteredAmount.toLocaleString('en-IN')}
          </span>
          {(selectedCategory !== 'All Categories' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedCategory('All Categories');
                setSearchTerm('');
              }}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline ml-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table List */}
      {filteredExpenses.length === 0 ? (
        <div className="text-center py-12 px-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No matching expenses found</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting search terms or record a new expense to see it in your ledger.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {(selectedCategory !== 'All Categories' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSearchTerm('');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
            >
              + Record Expense
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5">Title / Merchant</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5 text-right">Amount</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
              {filteredExpenses.map(expense => (
                <tr 
                  key={expense.id} 
                  className="group hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <td className="py-3.5 px-3.5 font-medium text-slate-900 dark:text-slate-100">
                    <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {expense.title}
                    </div>
                    {expense.description && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate max-w-sm mt-0.5">
                        {expense.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg border ${getCategoryColor(expense.category)}`}>
                      {getCategoryIcon(expense.category)}
                      <span>{expense.category}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{expense.date}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap text-sm tracking-tight">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
