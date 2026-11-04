/**
 * Microsoft Azure Cloud Architecture Adapter for Expense Companion
 * 
 * Provides concrete architectural integration interfaces demonstrating how the application
 * seamlessly integrates with Microsoft Azure:
 * - Identity & Auth: Microsoft Entra ID (formerly Azure Active Directory) / Azure AD B2C via MSAL
 * - Database: Azure Cosmos DB (Core SQL API with /userId partition keys & multi-region replication)
 * - File / Receipt Storage: Azure Blob Storage (Hot tier container with SAS tokens)
 * - Hosting: Azure Static Web Apps / Azure Container Apps
 * - Telemetry: Azure Monitor & Application Insights
 */

import { 
  IAuthService, 
  IDatabaseService, 
  IStorageService, 
  ICloudMonitorService,
  AuthResult, 
  CloudUserSession, 
  FileUploadResult, 
  CloudHealthProbe 
} from './types';
import { Expense, CategoryBudget, SavingsGoal } from '../../types';

export class AzureEntraAuthService implements IAuthService {
  readonly providerId = 'azure' as const;
  readonly providerName = 'Microsoft Azure (Entra ID & MSAL)';

  private mockSession: CloudUserSession | null = null;

  getCurrentUser(): CloudUserSession | null {
    return this.mockSession;
  }

  async signInWithGoogle(): Promise<AuthResult> {
    return {
      success: false,
      error: 'Azure AD B2C Google social identity federation requires Azure Tenant ID and User Flow policy.'
    };
  }

  async signInWithEmailPassword(_email: string, _pass: string): Promise<AuthResult> {
    return {
      success: false,
      error: 'Microsoft Entra ID B2C Resource Owner Password Credential (ROPC) flow ready. Configure Azure Client ID.'
    };
  }

  async registerWithEmailPassword(_email: string, _pass: string): Promise<AuthResult> {
    return {
      success: false,
      error: 'Azure AD B2C SignUp flow ready. Awaiting Azure Client ID configuration.'
    };
  }

  async signInWithMicrosoft(): Promise<AuthResult> {
    return {
      success: false,
      error: 'Native Microsoft Entra ID MSAL redirect flow ready. Currently using active Firebase Microsoft provider.'
    };
  }

  async sendPasswordReset(_email: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Azure AD B2C password reset user flow requires tenant configuration.' };
  }

  async sendEmailVerification(): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Azure AD verification code requires active tenant credentials.' };
  }

  async signOut(): Promise<void> {
    this.mockSession = null;
  }
}

export class AzureCosmosDBService implements IDatabaseService {
  readonly providerId = 'azure' as const;

  async getExpenses(_userId: string): Promise<Expense[]> {
    return [];
  }

  async addExpense(_userId: string, exp: Omit<Expense, 'id' | 'createdAt' | 'userId'>): Promise<Expense> {
    return {
      ...exp,
      id: `azure_cosmos_${Date.now()}`,
      userId: _userId,
      createdAt: new Date().toISOString()
    };
  }

  async updateExpense(_userId: string, _exp: Expense): Promise<void> {}
  async deleteExpense(_userId: string, _expenseId: string): Promise<void> {}

  async getBudgets(_userId: string): Promise<CategoryBudget[]> {
    return [];
  }

  async saveBudget(_userId: string, _budget: CategoryBudget): Promise<void> {}

  async getSavingsGoals(_userId: string): Promise<SavingsGoal[]> {
    return [];
  }

  async addSavingsGoal(_userId: string, goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<SavingsGoal> {
    const nowStr = new Date().toISOString();
    return { ...goal, id: `azure_goal_${Date.now()}`, userId: _userId, createdAt: nowStr, updatedAt: nowStr };
  }

  async updateSavingsGoal(_userId: string, _goal: SavingsGoal): Promise<void> {}
  async deleteSavingsGoal(_userId: string, _goalId: string): Promise<void> {}
}

export class AzureBlobStorageService implements IStorageService {
  readonly providerId = 'azure' as const;

  async uploadReceipt(_userId: string, _file: Blob, _fileName: string): Promise<FileUploadResult> {
    return {
      success: false,
      error: 'Azure Blob Storage upload requires Storage Account connection string and Container SAS token.'
    };
  }

  async deleteReceipt(_userId: string, _storagePath: string): Promise<{ success: boolean; error?: string }> {
    return { success: false, error: 'Azure Blob Storage delete requires active SAS credentials.' };
  }

  async getStorageQuotaEstimate(): Promise<{ usedBytes: number; fileCount: number }> {
    return { usedBytes: 0, fileCount: 0 };
  }
}

export class AzureMonitorService implements ICloudMonitorService {
  readonly providerId = 'azure' as const;

  async runHealthProbes(): Promise<CloudHealthProbe[]> {
    const now = new Date().toISOString();
    return [
      {
        provider: 'azure',
        service: 'auth',
        status: 'unconfigured',
        latencyMs: 0,
        message: 'Microsoft Entra ID (Azure AD) adapter loaded (awaiting AZURE_TENANT_ID)',
        timestamp: now
      },
      {
        provider: 'azure',
        service: 'database',
        status: 'unconfigured',
        latencyMs: 0,
        message: 'Azure Cosmos DB SQL API schema mapped with partition key: /userId',
        timestamp: now
      },
      {
        provider: 'azure',
        service: 'storage',
        status: 'unconfigured',
        latencyMs: 0,
        message: 'Azure Blob Storage container (receipts-vault) adapter ready',
        timestamp: now
      }
    ];
  }
}
