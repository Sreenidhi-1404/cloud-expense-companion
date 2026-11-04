import {
  Expense,
  CategoryBudget,
  SavingsGoal,
  FinancialHealthScoreData,
  AnomalyWarning,
  DuplicateWarning,
  CarbonImpactData,
  ExpenseCategory,
  SubscriptionItem,
  ExpensePredictionData,
  MonthlyTrendPoint
} from '../types';

// 1. FINANCIAL HEALTH SCORE (0 - 100)
export function calculateFinancialHealthScore(
  expenses: Expense[],
  budgets: CategoryBudget[],
  savingsGoals: SavingsGoal[]
): FinancialHealthScoreData {
  if (expenses.length === 0 && budgets.length === 0) {
    return {
      score: 85,
      status: 'Good',
      budgetAdherenceScore: 90,
      overspendingCount: 0,
      savingsProgressScore: 80,
      explanation: 'No recent expenses recorded. Your financial slate is clean and within control.'
    };
  }

  // Calculate current month spending by category
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));
  
  const categoryTotals: Record<string, number> = {};
  currentMonthExpenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Calculate overspending & budget adherence
  let overspendingCount = 0;
  let totalBudget = 0;
  let totalSpentInBudgets = 0;

  budgets.forEach(b => {
    if (b.monthlyLimit > 0) {
      totalBudget += b.monthlyLimit;
      const spent = categoryTotals[b.category] || 0;
      totalSpentInBudgets += spent;
      if (spent > b.monthlyLimit) {
        overspendingCount++;
      }
    }
  });

  // Budget Adherence Score (0 to 40 points)
  let budgetScore = 35;
  if (totalBudget > 0) {
    const ratio = totalSpentInBudgets / totalBudget;
    if (ratio <= 0.8) budgetScore = 40;
    else if (ratio <= 1.0) budgetScore = 32;
    else if (ratio <= 1.2) budgetScore = 20;
    else budgetScore = 10;
  }
  budgetScore = Math.max(0, budgetScore - overspendingCount * 5);

  // Savings Goals Progress Score (0 to 30 points)
  let savingsScore = 20; // Default baseline
  if (savingsGoals.length > 0) {
    let totalTarget = 0;
    let totalSaved = 0;
    savingsGoals.forEach(g => {
      totalTarget += g.targetAmount;
      totalSaved += Math.min(g.currentAmount, g.targetAmount);
    });
    const savingsRatio = totalTarget > 0 ? totalSaved / totalTarget : 0;
    savingsScore = Math.min(30, Math.round(savingsRatio * 30));
  }

  // Spending Consistency Score (0 to 30 points)
  let consistencyScore = 25;
  if (currentMonthExpenses.length > 5) {
    const amounts = currentMonthExpenses.map(e => e.amount);
    const maxAmt = Math.max(...amounts);
    const avgAmt = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    if (maxAmt > avgAmt * 4) {
      consistencyScore -= 10; // Penalty for massive spikes
    }
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(budgetScore + savingsScore + consistencyScore)));

  let status: FinancialHealthScoreData['status'] = 'Good';
  if (finalScore >= 80) status = 'Excellent';
  else if (finalScore >= 65) status = 'Good';
  else if (finalScore >= 50) status = 'Fair';
  else status = 'Needs Attention';

  // Construct explanation
  let explanation = '';
  if (overspendingCount > 0) {
    const overspentCats = budgets.filter(b => (categoryTotals[b.category] || 0) > b.monthlyLimit).map(b => b.category);
    explanation = `Your spending exceeds budget limit in ${overspentCats.join(', ')}. Try trimming discretionary purchases.`;
  } else if (finalScore >= 80) {
    explanation = 'Your spending is well within budget limits and savings goals are progressing steadily!';
  } else if (finalScore >= 65) {
    explanation = 'Your overall spending is in control, but keep an eye on higher volume categories.';
  } else {
    explanation = 'Multiple expense categories are nearing or past budgets. Review your monthly commitments.';
  }

  return {
    score: finalScore,
    status,
    budgetAdherenceScore: budgetScore,
    overspendingCount,
    savingsProgressScore: savingsScore,
    explanation
  };
}

// 2. UNUSUAL SPENDING DETECTION (ANOMALY)
export function detectUnusualSpending(
  amount: number,
  category: ExpenseCategory,
  allExpenses: Expense[]
): AnomalyWarning {
  const categoryExpenses = allExpenses.filter(e => e.category === category && e.amount > 0);
  
  if (categoryExpenses.length < 2) {
    return { isAnomaly: false, categoryAverage: amount, newAmount: amount, message: '' };
  }

  const avg = categoryExpenses.reduce((sum, e) => sum + e.amount, 0) / categoryExpenses.length;
  
  // Anomaly threshold: Expense is at least 2.5x higher than average AND at least 500 above avg
  if (amount >= avg * 2.5 && (amount - avg) >= 300) {
    const formattedAvg = Math.round(avg).toLocaleString('en-IN');
    const formattedAmount = amount.toLocaleString('en-IN');
    return {
      isAnomaly: true,
      categoryAverage: Math.round(avg),
      newAmount: amount,
      message: `⚠️ This expense (₹${formattedAmount}) is unusually high compared with your previous ${category} average of ₹${formattedAvg}.`
    };
  }

  return { isAnomaly: false, categoryAverage: Math.round(avg), newAmount: amount, message: '' };
}

// 3. DUPLICATE / SIMILAR PURCHASE DETECTION
export function detectDuplicateExpense(
  amount: number,
  category: ExpenseCategory,
  title: string,
  allExpenses: Expense[]
): DuplicateWarning {
  if (!amount || !category) return { isDuplicate: false, message: '' };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const matched = allExpenses.find(e => {
    const expDate = new Date(e.date);
    if (expDate < sevenDaysAgo) return false;

    const sameCategory = e.category === category;
    const sameOrSimilarTitle = e.title.toLowerCase().trim() === title.toLowerCase().trim() ||
      (title.length > 3 && e.title.toLowerCase().includes(title.toLowerCase()));
    
    // Amount difference within 10% or exact
    const amountDiff = Math.abs(e.amount - amount);
    const isSimilarAmount = amountDiff === 0 || (amountDiff / e.amount) <= 0.1;

    return sameCategory && (sameOrSimilarTitle || isSimilarAmount);
  });

  if (matched) {
    return {
      isDuplicate: true,
      matchedExpense: matched,
      message: `You recently recorded a similar expense "${matched.title}" (₹${matched.amount.toLocaleString('en-IN')}) on ${matched.date}.`
    };
  }

  return { isDuplicate: false, message: '' };
}

// 4. CARBON FOOTPRINT TRACKER
export function calculateCarbonImpact(expenses: Expense[]): CarbonImpactData {
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonthPrefix));

  if (monthlyExpenses.length === 0) {
    return {
      monthlyEcoScore: 15,
      impactLevel: 'Low',
      topCategory: 'None',
      categoryBreakdown: [],
      greenSuggestions: ['Log your daily purchases to track your estimated carbon footprint.']
    };
  }

  // Weight multipliers for categories (estimated relative impact units per ₹100 spent)
  const categoryWeights: Record<ExpenseCategory, number> = {
    Flight: 4.5,          // Very High
    Fuel: 3.5,            // High
    Travel: 2.5,          // Medium-High
    Shopping: 2.2,        // Medium
    Food: 2.0,            // Medium
    Subscriptions: 1.2,   // Low-Medium
    Entertainment: 1.2,   // Low-Medium
    Bills: 1.0,           // Low
    'Public Transport': 0.6, // Low
    Education: 0.5,       // Low
    Others: 1.5
  };

  const categoryTotals: Record<string, number> = {};
  let totalImpactPoints = 0;

  monthlyExpenses.forEach(e => {
    const weight = categoryWeights[e.category] || 1.5;
    const impact = (e.amount / 100) * weight;
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + impact;
    totalImpactPoints += impact;
  });

  // Find top contributing category
  let topCategory: ExpenseCategory | 'None' = 'None';
  let maxImpact = 0;

  Object.entries(categoryTotals).forEach(([cat, impact]) => {
    if (impact > maxImpact) {
      maxImpact = impact;
      topCategory = cat as ExpenseCategory;
    }
  });

  // Determine Impact Level
  let impactLevel: CarbonImpactData['impactLevel'] = 'Low';
  if (totalImpactPoints > 350) impactLevel = 'Very High';
  else if (totalImpactPoints > 200) impactLevel = 'High';
  else if (totalImpactPoints > 90) impactLevel = 'Medium';
  else impactLevel = 'Low';

  // Eco Score from 0 to 100 (100 = minimal carbon footprint, 0 = high impact)
  const monthlyEcoScore = Math.max(10, Math.min(100, Math.round(100 - (totalImpactPoints / 5))));

  // Breakdown percentages
  const breakdown = Object.entries(categoryTotals).map(([cat, imp]) => ({
    category: cat as ExpenseCategory,
    percentage: Math.round((imp / (totalImpactPoints || 1)) * 100),
    impact: imp > 100 ? 'High' : imp > 40 ? 'Medium' : 'Low' as 'Low' | 'Medium' | 'High' | 'Very High'
  })).sort((a, b) => b.percentage - a.percentage);

  // Suggestions
  const greenSuggestions: string[] = [];
  const topCatStr = String(topCategory);
  if (topCatStr === 'Flight' || topCatStr === 'Fuel' || topCatStr === 'Travel') {
    greenSuggestions.push('Consider carpooling or public transit for frequent city trips to reduce travel emissions.');
  }
  if (topCatStr === 'Shopping') {
    greenSuggestions.push('Group online orders together or choose eco-friendly local options to minimize packaging waste.');
  }
  if (topCatStr === 'Food') {
    greenSuggestions.push('Opt for locally sourced produce and plant-based options to lower food transport impact.');
  }
  if (greenSuggestions.length === 0) {
    greenSuggestions.push('Great job maintaining a low estimated carbon impact this month!');
  }

  return {
    monthlyEcoScore,
    impactLevel,
    topCategory,
    categoryBreakdown: breakdown,
    greenSuggestions
  };
}

// 5. SUBSCRIPTION LEAK DETECTOR
export function detectSubscriptions(expenses: Expense[]): SubscriptionItem[] {
  if (expenses.length < 3) return [];

  // Group expenses by lowercased title / vendor
  const titleMap: Record<string, Expense[]> = {};
  
  expenses.forEach(e => {
    const cleanTitle = e.title.trim().toLowerCase();
    if (!titleMap[cleanTitle]) {
      titleMap[cleanTitle] = [];
    }
    titleMap[cleanTitle].push(e);
  });

  const detected: SubscriptionItem[] = [];

  Object.entries(titleMap).forEach(([cleanTitle, itemExpenses]) => {
    if (itemExpenses.length >= 2) {
      // Sort by date ascending
      itemExpenses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const latest = itemExpenses[itemExpenses.length - 1];
      const previous = itemExpenses[itemExpenses.length - 2];

      // Check date difference in days
      const daysDiff = Math.abs(
        (new Date(latest.date).getTime() - new Date(previous.date).getTime()) / (1000 * 3600 * 24)
      );

      // Check if amount is roughly identical
      const amountDiff = Math.abs(latest.amount - previous.amount);
      const isSameAmount = amountDiff <= 5 || (amountDiff / latest.amount) <= 0.05;

      // Subscriptions typically repeat every 25 - 35 days, or user categorized as Subscriptions
      const isMonthlyInterval = daysDiff >= 20 && daysDiff <= 40;
      const isExplicitCategory = latest.category === 'Subscriptions';

      if (isSameAmount && (isMonthlyInterval || isExplicitCategory)) {
        detected.push({
          id: latest.id,
          title: latest.title,
          category: latest.category,
          monthlyCost: latest.amount,
          estimatedAnnualCost: latest.amount * 12,
          frequency: 'Monthly',
          lastDate: latest.date,
          confidence: isMonthlyInterval && isSameAmount ? 'High' : 'Medium'
        });
      }
    }
  });

  return detected;
}

// 6. EXPENSE PREDICTION
export function predictNextMonthExpenses(expenses: Expense[]): ExpensePredictionData {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Group expenses by YYYY-MM
  const monthlyTotals: Record<string, number> = {};

  expenses.forEach(e => {
    if (!e.date) return;
    const key = e.date.substring(0, 7); // 'YYYY-MM'
    monthlyTotals[key] = (monthlyTotals[key] || 0) + e.amount;
  });

  const sortedKeys = Object.keys(monthlyTotals).sort();

  if (sortedKeys.length === 0) {
    const now = new Date();
    const currMonthName = monthNames[now.getMonth()];
    const nextMonthName = monthNames[(now.getMonth() + 1) % 12];

    return {
      previousMonths: [
        { month: currMonthName, totalSpent: 0 }
      ],
      currentMonthSpent: 0,
      predictedNextMonthSpent: 0,
      trendDirection: 'stable',
      explanation: 'No historical expenses available yet. Add transactions to generate spending predictions.'
    };
  }

  // Pick up to the last 5 months
  const recentKeys = sortedKeys.slice(-5);
  const trendPoints: MonthlyTrendPoint[] = recentKeys.map(k => {
    const [yearStr, monthStr] = k.split('-');
    const mIdx = parseInt(monthStr, 10) - 1;
    return {
      month: monthNames[mIdx],
      totalSpent: Math.round(monthlyTotals[k])
    };
  });

  const currentMonthSpent = trendPoints[trendPoints.length - 1]?.totalSpent || 0;

  // Simple weighted moving average for prediction
  let totalWeight = 0;
  let weightedSum = 0;

  trendPoints.forEach((pt, idx) => {
    const weight = idx + 1; // Recent months carry higher weight
    weightedSum += pt.totalSpent * weight;
    totalWeight += weight;
  });

  const predictedNextMonthSpent = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : currentMonthSpent;

  // Determine trend direction
  let trendDirection: ExpensePredictionData['trendDirection'] = 'stable';
  if (predictedNextMonthSpent > currentMonthSpent * 1.05) {
    trendDirection = 'increasing';
  } else if (predictedNextMonthSpent < currentMonthSpent * 0.95) {
    trendDirection = 'decreasing';
  }

  const now = new Date();
  const nextMonthName = monthNames[(now.getMonth() + 1) % 12];

  let explanation = '';
  if (trendDirection === 'increasing') {
    explanation = `Based on your recent monthly spending pattern, ${nextMonthName}'s expenses are estimated to reach around ₹${predictedNextMonthSpent.toLocaleString('en-IN')}.`;
  } else if (trendDirection === 'decreasing') {
    explanation = `Your spending trend is slanting downward. Estimated spending for ${nextMonthName} is around ₹${predictedNextMonthSpent.toLocaleString('en-IN')}.`;
  } else {
    explanation = `Your spending is relatively consistent. Next month's expenses are estimated to be around ₹${predictedNextMonthSpent.toLocaleString('en-IN')}.`;
  }

  return {
    previousMonths: trendPoints,
    currentMonthSpent,
    predictedNextMonthSpent,
    trendDirection,
    explanation
  };
}
