import { Expense, CategoryBudget, SavingsGoal } from '../../types';

export type CloudProviderId = 'firebase' | 'aws' | 'azure';

export interface CloudUserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  providerId: 'google.com' | 'password' | 'microsoft.com' | 'apple.com' | 'aws-cognito' | 'azure-ad' | 'guest';
  emailVerified: boolean;
  role: 'user' | 'admin';
}

export interface AuthResult {
  success: boolean;
  user?: CloudUserSession;
  error?: string;
  requiresEmailVerification?: boolean;
}

export interface IAuthService {
  readonly providerId: CloudProviderId;
  readonly providerName: string;
  signInWithGoogle(): Promise<AuthResult>;
  signInWithEmailPassword(email: string, password: string): Promise<AuthResult>;
  registerWithEmailPassword(email: string, password: string): Promise<AuthResult>;
  signInWithMicrosoft?(): Promise<AuthResult>;
  signInWithApple?(): Promise<AuthResult>;
  sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }>;
  sendEmailVerification(): Promise<{ success: boolean; error?: string }>;
  signOut(): Promise<void>;
  getCurrentUser(): CloudUserSession | null;
}

export interface IDatabaseService {
  readonly providerId: CloudProviderId;
  getExpenses(userId: string): Promise<Expense[]>;
  addExpense(userId: string, expense: Omit<Expense, 'id' | 'createdAt' | 'userId'>): Promise<Expense>;
  updateExpense(userId: string, expense: Expense): Promise<void>;
  deleteExpense(userId: string, expenseId: string): Promise<void>;
  
  getBudgets(userId: string): Promise<CategoryBudget[]>;
  saveBudget(userId: string, budget: CategoryBudget): Promise<void>;
  
  getSavingsGoals(userId: string): Promise<SavingsGoal[]>;
  addSavingsGoal(userId: string, goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<SavingsGoal>;
  updateSavingsGoal(userId: string, goal: SavingsGoal): Promise<void>;
  deleteSavingsGoal(userId: string, goalId: string): Promise<void>;
}

export interface FileUploadResult {
  success: boolean;
  url?: string;
  storagePath?: string;
  error?: string;
}

export interface IStorageService {
  readonly providerId: CloudProviderId;
  uploadReceipt(userId: string, file: Blob, fileName: string): Promise<FileUploadResult>;
  deleteReceipt(userId: string, storagePath: string): Promise<{ success: boolean; error?: string }>;
  getStorageQuotaEstimate(): Promise<{ usedBytes: number; fileCount: number }>;
}

export interface CloudHealthProbe {
  provider: CloudProviderId;
  service: 'auth' | 'database' | 'storage' | 'compute';
  status: 'healthy' | 'degraded' | 'offline' | 'unconfigured';
  latencyMs: number;
  message: string;
  timestamp: string;
}

export interface ICloudMonitorService {
  readonly providerId: CloudProviderId;
  runHealthProbes(): Promise<CloudHealthProbe[]>;
}

export interface CloudPlatformDescriptor {
  id: CloudProviderId;
  name: string;
  company: string;
  status: 'active' | 'ready_to_provision' | 'architectural_adapter';
  description: string;
  services: {
    auth: { name: string; mechanism: string; status: string };
    database: { name: string; type: string; status: string };
    storage: { name: string; type: string; status: string };
    hosting: { name: string; type: string; status: string };
  };
  securityCompliance: string[];
}
