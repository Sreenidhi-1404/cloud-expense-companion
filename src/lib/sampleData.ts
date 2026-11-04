import { Expense, SavingsGoal } from '../types';

export function generateStarterExpenses(userId: string): Expense[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const prevMonthObj = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYear = prevMonthObj.getFullYear();
  const prevMonth = String(prevMonthObj.getMonth() + 1).padStart(2, '0');

  return [
    {
      id: `sample_1`,
      userId,
      title: 'Grocery Store Market',
      amount: 1450,
      category: 'Food',
      date: `${year}-${month}-02`,
      description: 'Weekly grocery supplies and vegetables',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_2`,
      userId,
      title: 'Uber Commute',
      amount: 320,
      category: 'Travel',
      date: `${year}-${month}-03`,
      description: 'Cab fare to office',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_3`,
      userId,
      title: 'Netflix Subscription',
      amount: 499,
      category: 'Subscriptions',
      date: `${year}-${month}-05`,
      description: 'Monthly OTT entertainment plan',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_4`,
      userId,
      title: 'Electricity & Utility Bill',
      amount: 2850,
      category: 'Bills',
      date: `${year}-${month}-06`,
      description: 'Monthly home electric bill',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_5`,
      userId,
      title: 'Petrol Refill',
      amount: 1200,
      category: 'Fuel',
      date: `${year}-${month}-07`,
      description: 'Car fuel tank fill',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_6`,
      userId,
      title: 'Restaurant Dinner',
      amount: 1850,
      category: 'Food',
      date: `${year}-${month}-08`,
      description: 'Dinner with colleagues',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_7`,
      userId,
      title: 'Spotify Premium',
      amount: 119,
      category: 'Subscriptions',
      date: `${year}-${month}-08`,
      description: 'Monthly music streaming',
      createdAt: new Date().toISOString()
    },
    // Previous month expenses for historical trend & subscription detection
    {
      id: `sample_8`,
      userId,
      title: 'Netflix Subscription',
      amount: 499,
      category: 'Subscriptions',
      date: `${prevYear}-${prevMonth}-05`,
      description: 'Previous month OTT plan',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_9`,
      userId,
      title: 'Grocery Store Market',
      amount: 1200,
      category: 'Food',
      date: `${prevYear}-${prevMonth}-12`,
      description: 'Monthly groceries',
      createdAt: new Date().toISOString()
    },
    {
      id: `sample_10`,
      userId,
      title: 'Spotify Premium',
      amount: 119,
      category: 'Subscriptions',
      date: `${prevYear}-${prevMonth}-08`,
      description: 'Previous month music streaming',
      createdAt: new Date().toISOString()
    }
  ];
}

export function generateStarterGoals(userId: string): SavingsGoal[] {
  return [
    {
      id: 'sample_goal_1',
      userId,
      name: 'New Work Laptop',
      targetAmount: 80000,
      currentAmount: 35000,
      deadline: '2026-12-31',
      description: 'High-performance laptop for development and design',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sample_goal_2',
      userId,
      name: 'Emergency Fund',
      targetAmount: 50000,
      currentAmount: 28000,
      deadline: '2026-10-15',
      description: '3 months of essential buffer savings',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}
