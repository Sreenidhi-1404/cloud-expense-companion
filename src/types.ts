export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Entertainment'
  | 'Fuel'
  | 'Flight'
  | 'Public Transport'
  | 'Education'
  | 'Subscriptions'
  | 'Others';

export type IncomeCategory =
  | 'Salary'
  | 'Freelance'
  | 'Investments'
  | 'Business'
  | 'Rental'
  | 'Bonus'
  | 'Other';

export interface IncomeRecord {
  id: string;
  userId: string;
  source: string;
  amount: number;
  category: IncomeCategory;
  date: string; // ISO format 'YYYY-MM-DD'
  description?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // ISO format 'YYYY-MM-DD'
  description?: string;
  createdAt: string;
}

export interface CategoryBudget {
  category: ExpenseCategory;
  monthlyLimit: number;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // 'YYYY-MM-DD'
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialHealthScoreData {
  score: number; // 0 - 100
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  budgetAdherenceScore: number;
  overspendingCount: number;
  savingsProgressScore: number;
  explanation: string;
}

export interface AnomalyWarning {
  isAnomaly: boolean;
  categoryAverage: number;
  newAmount: number;
  message: string;
}

export interface DuplicateWarning {
  isDuplicate: boolean;
  matchedExpense?: Expense;
  message: string;
}

export interface CarbonImpactData {
  monthlyEcoScore: number; // e.g. 0-100 or kg CO2e estimate
  impactLevel: 'Low' | 'Medium' | 'High' | 'Very High';
  topCategory: ExpenseCategory | 'None';
  categoryBreakdown: { category: ExpenseCategory; percentage: number; impact: 'Low' | 'Medium' | 'High' | 'Very High' }[];
  greenSuggestions: string[];
}

export interface SubscriptionItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  monthlyCost: number;
  estimatedAnnualCost: number;
  frequency: string;
  lastDate: string;
  confidence: 'High' | 'Medium';
}

export interface MonthlyTrendPoint {
  month: string; // e.g. 'May', 'Jun', 'Jul', 'Aug'
  totalSpent: number;
  isPredicted?: boolean;
}

export interface ExpensePredictionData {
  previousMonths: MonthlyTrendPoint[];
  currentMonthSpent: number;
  predictedNextMonthSpent: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  explanation: string;
}

export interface AIRecommendation {
  trendSummary: string;
  budgetStatusAlerts: string[];
  suggestedReduction: string;
  potentialSavings: number;
  insightsList: string[];
}
