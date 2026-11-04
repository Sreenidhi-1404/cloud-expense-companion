import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Calendar,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Expense, ExpenseCategory } from '../types';

interface Props {
  expenses: Expense[];
  monthlyBudgetTotal?: number;
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

export const DailySpendingTrendChart: React.FC<Props> = ({
  expenses,
  monthlyBudgetTotal = 0
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'both' | 'cumulative' | 'daily'>('both');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth(); // 0-indexed
  const currentMonthStr = String(currentMonthNum + 1).padStart(2, '0');
  const currentMonthPrefix = `${currentYear}-${currentMonthStr}`;
  const monthName = now.toLocaleString('en-US', { month: 'long' });
  const currentDay = now.getDate();
  const totalDaysInMonth = new Date(currentYear, currentMonthNum + 1, 0).getDate();

  // Filter expenses for current month & selected category
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const isCurrentMonth = e.date.startsWith(currentMonthPrefix);
      if (!isCurrentMonth) return false;
      if (selectedCategory !== 'All' && e.category !== selectedCategory) return false;
      return true;
    });
  }, [expenses, currentMonthPrefix, selectedCategory]);

  // Aggregate daily data
  const { chartData, totalSpent, peakDay, peakAmount, avgDailySpend, momentumStatus } = useMemo(() => {
    // Determine the max day to plot: at least today, or latest logged day in current month
    let maxDayToPlot = Math.max(currentDay, 1);
    currentMonthExpenses.forEach(e => {
      const parts = e.date.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        if (!isNaN(d) && d > maxDayToPlot && d <= totalDaysInMonth) {
          maxDayToPlot = d;
        }
      }
    });

    // Map by day
    const dayTotals: Record<number, { amount: number; count: number; items: string[] }> = {};
    for (let d = 1; d <= maxDayToPlot; d++) {
      dayTotals[d] = { amount: 0, count: 0, items: [] };
    }

    currentMonthExpenses.forEach(e => {
      const parts = e.date.split('-');
      if (parts.length === 3) {
        const d = parseInt(parts[2], 10);
        if (dayTotals[d]) {
          dayTotals[d].amount += e.amount;
          dayTotals[d].count += 1;
          if (dayTotals[d].items.length < 3) {
            dayTotals[d].items.push(e.title);
          }
        }
      }
    });

    let cumulative = 0;
    let peakD = 1;
    let peakAmt = 0;
    const data = [];

    // Linear ideal budget pace per day if budget is set
    const dailyBudgetPace = monthlyBudgetTotal > 0 ? monthlyBudgetTotal / totalDaysInMonth : 0;

    for (let d = 1; d <= maxDayToPlot; d++) {
      const dailyAmt = dayTotals[d]?.amount || 0;
      cumulative += dailyAmt;

      if (dailyAmt > peakAmt) {
        peakAmt = dailyAmt;
        peakD = d;
      }

      const isToday = d === currentDay;
      const dayLabel = `${monthName.slice(0, 3)} ${d}${isToday ? ' (Today)' : ''}`;

      data.push({
        day: d,
        dayLabel,
        dailySpend: dailyAmt,
        cumulativeSpend: cumulative,
        count: dayTotals[d]?.count || 0,
        sampleItems: dayTotals[d]?.items || [],
        idealBudgetPace: dailyBudgetPace > 0 ? Math.round(dailyBudgetPace * d) : undefined,
        isToday
      });
    }

    const calculatedTotal = cumulative;
    const calculatedAvg = maxDayToPlot > 0 ? Math.round(calculatedTotal / maxDayToPlot) : 0;

    // Calculate momentum (last 3 days vs overall daily average)
    let last3DaysSpend = 0;
    let daysCounted = 0;
    for (let d = Math.max(1, maxDayToPlot - 2); d <= maxDayToPlot; d++) {
      last3DaysSpend += dayTotals[d]?.amount || 0;
      daysCounted++;
    }
    const recentAvg = daysCounted > 0 ? last3DaysSpend / daysCounted : 0;
    
    let momentum: 'surge' | 'steady' | 'cooling' = 'steady';
    if (calculatedAvg > 0) {
      if (recentAvg > calculatedAvg * 1.3) {
        momentum = 'surge';
      } else if (recentAvg < calculatedAvg * 0.7) {
        momentum = 'cooling';
      }
    }

    return {
      chartData: data,
      totalSpent: calculatedTotal,
      peakDay: peakD,
      peakAmount: peakAmt,
      avgDailySpend: calculatedAvg,
      momentumStatus: momentum
    };
  }, [currentMonthExpenses, currentDay, totalDaysInMonth, monthName, monthlyBudgetTotal, selectedCategory]);

  return (
    <div
      id="daily-spending-trends-card"
      className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/30 transition-all duration-300"
    >
      {/* Header section with Title, Badges, and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/20 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Daily Spending Momentum
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <Calendar className="w-3 h-3" />
                  {monthName} {currentYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing day-by-day velocity and cumulative expenditure curve
              </p>
            </div>
          </div>
        </div>

        {/* View toggles & Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Filter */}
          <div className="relative inline-flex items-center">
            <Filter className="w-3.5 h-3.5 absolute left-2.5 text-slate-400 pointer-events-none" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 cursor-pointer appearance-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Mode switch pills */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('both')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Dual View
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'cumulative'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Cumulative
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Daily
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            {selectedCategory === 'All' ? 'Month Total' : `${selectedCategory} Total`}
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            ₹{totalSpent.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3" />
            {currentMonthExpenses.length} entries recorded
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Daily Average
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            ₹{avgDailySpend.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            across {chartData.length} elapsed days
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Highest Spending Day
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {peakAmount > 0 ? `₹${peakAmount.toLocaleString('en-IN')}` : '₹0'}
          </span>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5">
            <Flame className="w-3 h-3" />
            {peakAmount > 0 ? `${monthName.slice(0, 3)} ${peakDay}` : 'No records'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
            Spending Momentum
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            {momentumStatus === 'surge' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                <ArrowUpRight className="w-3.5 h-3.5" /> Accelerating
              </span>
            ) : momentumStatus === 'cooling' ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <ArrowDownRight className="w-3.5 h-3.5" /> Controlled
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Zap className="w-3.5 h-3.5" /> Steady Pace
              </span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            Based on 3-day velocity
          </span>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="w-full h-72 sm:h-80">
        {chartData.length === 0 || totalSpent === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 text-center">
            <Calendar className="w-10 h-10 text-slate-400 mb-2" />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No spending logged for {monthName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1">
              Add your daily expenses using the "Record Expense" button above to view your spending trajectory.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
            >
              <defs>
                {/* Gradient for Cumulative Momentum Area */}
                <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                {/* Gradient for Daily Spend Area */}
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800/80"
              />

              <XAxis
                dataKey="day"
                tickFormatter={(d: number) => `${monthName.slice(0, 3)} ${d}`}
                tick={{ fontSize: 11 }}
                className="text-slate-500 dark:text-slate-400"
                stroke="currentColor"
              />

              <YAxis
                tickFormatter={(val: number) =>
                  val >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`
                }
                tick={{ fontSize: 11 }}
                className="text-slate-500 dark:text-slate-400"
                stroke="currentColor"
                width={50}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-xs min-w-[200px]">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                          <span className="font-semibold text-slate-200">
                            {monthName} {label}, {currentYear}
                          </span>
                          {item.isToday && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/30 text-emerald-300">
                              Today
                            </span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                              Daily Spent:
                            </span>
                            <span className="font-bold text-indigo-300">
                              ₹{item.dailySpend.toLocaleString('en-IN')}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-slate-400 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                              Cumulative Total:
                            </span>
                            <span className="font-bold text-emerald-400">
                              ₹{item.cumulativeSpend.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {item.idealBudgetPace !== undefined && (
                            <div className="flex justify-between items-center text-slate-400 text-[11px]">
                              <span>Budget Pace Guide:</span>
                              <span className="text-slate-300">
                                ₹{item.idealBudgetPace.toLocaleString('en-IN')}
                              </span>
                            </div>
                          )}

                          {item.count > 0 && (
                            <div className="pt-1.5 mt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                              <span>{item.count} transaction{item.count > 1 ? 's' : ''}: </span>
                              <span className="text-slate-300 italic truncate block">
                                {item.sampleItems.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                iconType="circle"
              />

              {/* Reference line for average daily spend */}
              {avgDailySpend > 0 && (viewMode === 'daily' || viewMode === 'both') && (
                <ReferenceLine
                  y={avgDailySpend}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Avg ₹${avgDailySpend}`,
                    position: 'insideTopLeft',
                    fill: '#f59e0b',
                    fontSize: 10,
                    fontWeight: 600
                  }}
                />
              )}

              {/* Cumulative Momentum Line / Area */}
              {(viewMode === 'cumulative' || viewMode === 'both') && (
                <Area
                  type="monotone"
                  dataKey="cumulativeSpend"
                  name="Cumulative Momentum"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#cumulativeGradient)"
                  activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                />
              )}

              {/* Daily Spending Line */}
              {(viewMode === 'daily' || viewMode === 'both') && (
                <Line
                  type="monotone"
                  dataKey="dailySpend"
                  name="Daily Expense"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#6366f1' }}
                  activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2, fill: '#ffffff' }}
                />
              )}

              {/* Linear Budget Pace Line (if budget exists and cumulative is visible) */}
              {monthlyBudgetTotal > 0 && (viewMode === 'cumulative' || viewMode === 'both') && (
                <Line
                  type="linear"
                  dataKey="idealBudgetPace"
                  name="Ideal Budget Pace"
                  stroke="#94a3b8"
                  strokeDasharray="5 5"
                  strokeWidth={1.5}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Insight Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
        <span className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {momentumStatus === 'surge'
              ? 'Spending velocity is accelerating this week. Keep an eye on non-essential categories.'
              : momentumStatus === 'cooling'
              ? 'Spending has cooled down over recent days. Great budget discipline!'
              : 'Consistent spending momentum aligned with daily averages.'}
          </span>
        </span>
        <span className="font-medium text-slate-400">
          Showing Day 1 to {chartData.length} of {totalDaysInMonth}
        </span>
      </div>
    </div>
  );
};
