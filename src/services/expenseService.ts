import {
  Expense,
  CategoryBudget,
  SavingsGoal,
  IncomeRecord,
} from '../types';

import { getAuthHeaders } from '../lib/auth';

export interface FirestoreSyncStatus {
  action: string;
  message: string;
  isPermissionError: boolean;
  timestamp: number;
}

type StatusCallback = (status: FirestoreSyncStatus) => void;

const statusListeners = new Set<StatusCallback>();

export function onFirestoreSyncStatus(
  callback: StatusCallback
): () => void {
  statusListeners.add(callback);
  return () => statusListeners.delete(callback);
}

// User documents are created by the MongoDB registration endpoint.
export async function ensureUserDocument(
  _userId: string,
  _email?: string | null,
  _displayName?: string | null
): Promise<void> {
  return;
}

// Shared API request handler with JWT authentication.
async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.body
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.success === false) {
    throw new Error(
      payload.error || `Request failed (${response.status})`
    );
  }

  return payload as T;
}

function requireUser(userId: string | null): string {
  if (!userId || userId === 'guest') {
    throw new Error(
      'Please sign in before saving financial data.'
    );
  }

  return userId;
}

type ListResponse<T> = {
  success: true;
  data: T[];
};

type ItemResponse<T> = {
  success: true;
  data: T;
};

type SuccessResponse = {
  success: true;
};

// ==================== EXPENSES ====================

export async function getUserExpenses(
  userId: string | null
): Promise<Expense[]> {
  const uid = requireUser(userId);

  const result = await apiRequest<ListResponse<Expense>>(
    `/api/expenses?userId=${encodeURIComponent(uid)}`
  );

  return result.data;
}

export async function addExpense(
  userId: string | null,
  expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>
): Promise<Expense> {
  const uid = requireUser(userId);

  const result = await apiRequest<ItemResponse<Expense>>(
    '/api/expenses',
    {
      method: 'POST',
      body: JSON.stringify({ ...expense, userId: uid }),
    }
  );

  return result.data;
}

export async function updateExpense(
  userId: string | null,
  expense: Expense
): Promise<void> {
  const uid = requireUser(userId);

  await apiRequest<SuccessResponse>(
    `/api/expenses/${encodeURIComponent(expense.id)}?userId=${encodeURIComponent(uid)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ ...expense, userId: uid }),
    }
  );
}

export async function deleteExpense(
  userId: string | null,
  expenseId: string
): Promise<void> {
  const uid = requireUser(userId);

  await apiRequest<SuccessResponse>(
    `/api/expenses/${encodeURIComponent(expenseId)}?userId=${encodeURIComponent(uid)}`,
    {
      method: 'DELETE',
    }
  );
}

// ==================== BUDGETS ====================

export async function getUserBudgets(
  userId: string | null
): Promise<CategoryBudget[]> {
  const uid = requireUser(userId);

  const result = await apiRequest<ListResponse<CategoryBudget>>(
    `/api/budgets?userId=${encodeURIComponent(uid)}`
  );

  return result.data;
}

export async function saveCategoryBudget(
  userId: string | null,
  budget: CategoryBudget
): Promise<void> {
  const uid = requireUser(userId);

  await apiRequest<SuccessResponse>('/api/budgets', {
    method: 'POST',
    body: JSON.stringify({ ...budget, userId: uid }),
  });
}

// ==================== SAVINGS GOALS ====================

export async function getUserSavingsGoals(
  userId: string | null
): Promise<SavingsGoal[]> {
  const uid = requireUser(userId);

  const result = await apiRequest<ListResponse<SavingsGoal>>(
    `/api/goals?userId=${encodeURIComponent(uid)}`
  );

  return result.data;
}

export async function addSavingsGoal(
  userId: string | null,
  goal: Omit<
    SavingsGoal,
    'id' | 'createdAt' | 'updatedAt' | 'userId'
  >
): Promise<SavingsGoal> {
  const uid = requireUser(userId);

  const result = await apiRequest<ItemResponse<SavingsGoal>>(
    '/api/goals',
    {
      method: 'POST',
      body: JSON.stringify({ ...goal, userId: uid }),
    }
  );

  return result.data;
}

export async function updateSavingsGoal(
  userId: string | null,
  goal: SavingsGoal
): Promise<void> {
  const uid = requireUser(userId);

  await apiRequest<SuccessResponse>(
    `/api/goals/${encodeURIComponent(goal.id)}?userId=${encodeURIComponent(uid)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ ...goal, userId: uid }),
    }
  );
}

export async function deleteSavingsGoal(
  userId: string | null,
  goalId: string
): Promise<void> {
  const uid = requireUser(userId);

  await apiRequest<SuccessResponse>(
    `/api/goals/${encodeURIComponent(goalId)}?userId=${encodeURIComponent(uid)}`,
    {
      method: 'DELETE',
    }
  );
}

// ==================== INCOMES ====================

export async function getUserIncomes(
  userId: string | null
): Promise<IncomeRecord[]> {
  const uid = requireUser(userId);

  const result = await apiRequest<ListResponse<IncomeRecord>>(
    `/api/incomes?userId=${encodeURIComponent(uid)}`
  );

  return result.data;
}

export async function addIncome(
  userId: string | null,
  income: Omit<IncomeRecord, 'id' | 'createdAt' | 'userId'>
): Promise<IncomeRecord> {
  const uid = requireUser(userId);

  const result = await apiRequest<ItemResponse<IncomeRecord>>(
    '/api/incomes',
    {
      method: 'POST',
      body: JSON.stringify({ ...income, userId: uid }),
    }
  );

  return result.data;
}

export async function updateIncome(
  userId: string | null,
  income: IncomeRecord
): Promise<void> {
  const uid = requireUser(userId);

  await apiRequest<SuccessResponse>(
    `/api/incomes/${encodeURIComponent(income.id)}?userId=${encodeURIComponent(uid)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ ...income, userId: uid }),
    }
  );
}

export async function deleteIncome(
  userId: string | null,
  incomeId: string
): Promise<void> {
  const uid = requireUser(userId);

  await apiRequest<SuccessResponse>(
    `/api/incomes/${encodeURIComponent(incomeId)}?userId=${encodeURIComponent(uid)}`,
    {
      method: 'DELETE',
    }
  );
}