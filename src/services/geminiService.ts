import { Expense, CategoryBudget, AIRecommendation } from '../types';

// Client-side cache to avoid repeated requests and prevent 429 quota exhaustion
let cachedRecommendations: { data: AIRecommendation; timestamp: number } | null = null;
const CLIENT_CACHE_DURATION_MS = 3 * 60 * 1000; // 3 minutes

export async function generateAIBudgetRecommendations(
  expenses: Expense[],
  budgets: CategoryBudget[]
): Promise<AIRecommendation> {
  // 1. Calculate deterministic analytical stats directly from user's actual ledger
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthPrefix = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  const currentExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  const previousExpenses = expenses.filter(e => e.date.startsWith(lastMonthPrefix));

  const currTotals: Record<string, number> = {};
  currentExpenses.forEach(e => {
    currTotals[e.category] = (currTotals[e.category] || 0) + e.amount;
  });

  const prevTotals: Record<string, number> = {};
  previousExpenses.forEach(e => {
    prevTotals[e.category] = (prevTotals[e.category] || 0) + e.amount;
  });

  const totalCurrSpent = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPrevSpent = previousExpenses.reduce((sum, e) => sum + e.amount, 0);

  const alerts: string[] = [];
  let highestOverspentCat = '';
  let highestOverspentAmt = 0;

  budgets.forEach(b => {
    const spent = currTotals[b.category] || 0;
    if (b.monthlyLimit > 0) {
      if (spent >= b.monthlyLimit) {
        alerts.push(`You have exceeded your ${b.category} budget limit (₹${spent.toLocaleString('en-IN')} / ₹${b.monthlyLimit.toLocaleString('en-IN')}).`);
        if (spent - b.monthlyLimit > highestOverspentAmt) {
          highestOverspentAmt = spent - b.monthlyLimit;
          highestOverspentCat = b.category;
        }
      } else if (spent >= b.monthlyLimit * 0.8) {
        alerts.push(`You are close to your ${b.category} budget limit (${Math.round((spent / b.monthlyLimit) * 100)}% utilized).`);
      }
    }
  });

  // Calculate percentage change
  let trendSummary = '';
  const foodCurr = currTotals['Food'] || 0;
  const foodPrev = prevTotals['Food'] || 0;

  if (foodPrev > 0 && foodCurr > 0) {
    const pct = Math.round(((foodCurr - foodPrev) / foodPrev) * 100);
    if (pct > 0) {
      trendSummary = `Food spending increased by ${pct}% compared with last month.`;
    } else {
      trendSummary = `Food spending decreased by ${Math.abs(pct)}% compared with last month.`;
    }
  } else if (totalPrevSpent > 0) {
    const overallPct = Math.round(((totalCurrSpent - totalPrevSpent) / totalPrevSpent) * 100);
    trendSummary = overallPct >= 0 
      ? `Total expenses increased by ${overallPct}% compared with last month.` 
      : `Total expenses decreased by ${Math.abs(overallPct)}% compared with last month.`;
  } else {
    trendSummary = `Logged ${currentExpenses.length} transaction(s) totalling ₹${totalCurrSpent.toLocaleString('en-IN')} this month.`;
  }

  // Suggest realistic reduction
  let suggestedReduction = '';
  let potentialSavings = 500;

  if (highestOverspentCat) {
    potentialSavings = Math.max(500, Math.round(highestOverspentAmt));
    suggestedReduction = `Reducing ${highestOverspentCat} expenses by approximately ₹${potentialSavings.toLocaleString('en-IN')} this month could help you stay within your target.`;
  } else if (foodCurr > 2000) {
    potentialSavings = Math.round(foodCurr * 0.15);
    suggestedReduction = `Reducing Food expenses by approximately ₹${potentialSavings.toLocaleString('en-IN')} this month could help you optimize your monthly savings.`;
  } else {
    potentialSavings = 500;
    suggestedReduction = `Trimming small discretionary purchases by ₹500 this month will help boost your savings goal momentum.`;
  }

  const defaultInsights = [
    trendSummary,
    alerts.length > 0 ? alerts[0] : 'All active categories are currently within defined budget boundaries.',
    suggestedReduction,
    'Consistently tracking recurring expenses helps prevent unnoticed subscription leakage.'
  ];

  const deterministicFallback: AIRecommendation = {
    trendSummary,
    budgetStatusAlerts: alerts.length > 0 ? alerts : ['You are currently within all set category budgets.'],
    suggestedReduction,
    potentialSavings,
    insightsList: defaultInsights
  };

  // 2. Return cached response if valid and not expired
  if (cachedRecommendations && (Date.now() - cachedRecommendations.timestamp) < CLIENT_CACHE_DURATION_MS) {
    return cachedRecommendations.data;
  }

  // 3. Request through secure backend proxy with automatic server caching and 429 quota protection
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        totalCurrSpent,
        totalPrevSpent,
        currTotals,
        budgets,
        alerts,
        deterministicFallback
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        const validated: AIRecommendation = {
          trendSummary: result.data.trendSummary || deterministicFallback.trendSummary,
          budgetStatusAlerts: result.data.budgetStatusAlerts || deterministicFallback.budgetStatusAlerts,
          suggestedReduction: result.data.suggestedReduction || deterministicFallback.suggestedReduction,
          potentialSavings: Number(result.data.potentialSavings) || deterministicFallback.potentialSavings,
          insightsList: Array.isArray(result.data.insightsList) && result.data.insightsList.length > 0 
            ? result.data.insightsList 
            : deterministicFallback.insightsList
        };
        cachedRecommendations = { data: validated, timestamp: Date.now() };
        return validated;
      }
    }
  } catch (err) {
    console.warn('Backend recommendation proxy unavailable, using deterministic calculations:', err);
  }

  // Guaranteed resilient fallback
  cachedRecommendations = { data: deterministicFallback, timestamp: Date.now() };
  return deterministicFallback;
}
