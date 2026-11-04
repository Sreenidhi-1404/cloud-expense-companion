import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { Target, Plus, Edit2, Trash2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
  onUpdateGoal: (goal: SavingsGoal) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
}

export const SavingsGoals: React.FC<Props> = ({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  // Quick progress update state
  const [progressUpdateGoal, setProgressUpdateGoal] = useState<SavingsGoal | null>(null);
  const [additionalSaved, setAdditionalSaved] = useState('');

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    
    // Default deadline 6 months from now
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    setDeadline(future.toISOString().split('T')[0]);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(g.targetAmount.toString());
    setCurrentAmount(g.currentAmount.toString());
    setDeadline(g.deadline);
    setDescription(g.description || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetNum = parseFloat(targetAmount);
    const currentNum = parseFloat(currentAmount) || 0;

    if (!name || isNaN(targetNum) || targetNum <= 0 || !deadline) return;

    if (editingGoal) {
      await onUpdateGoal({
        ...editingGoal,
        name,
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadline,
        description
      });
    } else {
      await onAddGoal({
        name,
        targetAmount: targetNum,
        currentAmount: currentNum,
        deadline,
        description
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveProgressUpdate = async () => {
    if (!progressUpdateGoal) return;
    const added = parseFloat(additionalSaved) || 0;
    const updatedAmount = Math.max(0, progressUpdateGoal.currentAmount + added);

    await onUpdateGoal({
      ...progressUpdateGoal,
      currentAmount: updatedAmount
    });

    setProgressUpdateGoal(null);
    setAdditionalSaved('');
  };

  const calculateRequiredMonthlySaving = (target: number, current: number, deadlineStr: string) => {
    const remaining = Math.max(0, target - current);
    if (remaining === 0) return 0;

    const deadlineDate = new Date(deadlineStr);
    const now = new Date();
    const monthsDiff = (deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth());

    if (monthsDiff <= 0) return remaining;
    return Math.round(remaining / monthsDiff);
  };

  return (
    <div id="savings-goals-card" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Savings Goals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track targets, monthly required savings, and deadlines
            </p>
          </div>
        </div>

        <button
          id="add-savings-goal-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-95 hover:shadow-indigo-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>New Goal</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-10 bg-slate-50/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Target className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No savings goals set yet</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Create a goal to start tracking progress towards your financial milestones.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {goals.map(goal => {
            const progress = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
            const reqMonthly = calculateRequiredMonthlySaving(goal.targetAmount, goal.currentAmount, goal.deadline);

            return (
              <div 
                key={goal.id} 
                className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400/50 dark:hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3.5 shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {goal.name}
                      </h4>
                      {goal.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-600 dark:text-slate-400">
                        Saved: <strong className="text-slate-900 dark:text-slate-100">₹{goal.currentAmount.toLocaleString('en-IN')}</strong>
                      </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Details Footer */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <div>
                    <span className="block">Target: <strong>₹{goal.targetAmount.toLocaleString('en-IN')}</strong></span>
                    <span className="block text-slate-400">Remaining: ₹{remaining.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="block flex items-center justify-end space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{goal.deadline}</span>
                    </span>
                    <span className="block text-indigo-600 dark:text-indigo-400 font-medium">
                      Req: ₹{reqMonthly.toLocaleString('en-IN')}/mo
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setProgressUpdateGoal(goal)}
                  className="w-full py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors text-center cursor-pointer"
                >
                  + Add Saved Progress
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div id="savings-goal-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Goal Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laptop, Emergency Fund, Vacation"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="80000"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Saved (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="35000"
                    value={currentAmount}
                    onChange={e => setCurrentAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Deadline *
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short note about this target..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress update quick modal */}
      {progressUpdateGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
              Add Saved Amount
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Goal: {progressUpdateGoal.name}
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Additional Amount Saved (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 2000"
                  value={additionalSaved}
                  onChange={e => setAdditionalSaved(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setProgressUpdateGoal(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProgressUpdate}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-xl cursor-pointer"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
