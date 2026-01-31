import { apiClient } from './client';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  organizationId: string;
  parentId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAccountDto {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentId?: string;
  isActive?: boolean;
}

export interface UpdateAccountDto {
  code?: string;
  name?: string;
  parentId?: string;
  isActive?: boolean;
}

export interface Transaction {
  id: string;
  organizationId: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  description?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionDto {
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  description?: string;
  date?: string;
}

export interface UpdateTransactionDto {
  debitAccountId?: string;
  creditAccountId?: string;
  amount?: number;
  description?: string;
  date?: string;
}

export const accountingApi = {
  // Accounts
  getAccounts: async (
    organizationId: string,
    includeInactive = false
  ): Promise<Account[]> => {
    const response = await apiClient.get<Account[]>(
      `/organizations/${organizationId}/accounts`,
      {
        params: { includeInactive },
      }
    );
    return response.data;
  },

  getAccount: async (
    organizationId: string,
    accountId: string
  ): Promise<Account> => {
    const response = await apiClient.get<Account>(
      `/organizations/${organizationId}/accounts/${accountId}`
    );
    return response.data;
  },

  createAccount: async (
    organizationId: string,
    data: CreateAccountDto
  ): Promise<Account> => {
    const response = await apiClient.post<Account>(
      `/organizations/${organizationId}/accounts`,
      data
    );
    return response.data;
  },

  updateAccount: async (
    organizationId: string,
    accountId: string,
    data: UpdateAccountDto
  ): Promise<Account> => {
    const response = await apiClient.patch<Account>(
      `/organizations/${organizationId}/accounts/${accountId}`,
      data
    );
    return response.data;
  },

  deleteAccount: async (
    organizationId: string,
    accountId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/organizations/${organizationId}/accounts/${accountId}`
    );
  },

  // Transactions
  getTransactions: async (
    organizationId: string,
    filters?: {
      accountId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Transaction[]> => {
    const response = await apiClient.get<Transaction[]>(
      `/organizations/${organizationId}/transactions`,
      {
        params: filters,
      }
    );
    return response.data;
  },

  getTransaction: async (
    organizationId: string,
    transactionId: string
  ): Promise<Transaction> => {
    const response = await apiClient.get<Transaction>(
      `/organizations/${organizationId}/transactions/${transactionId}`
    );
    return response.data;
  },

  createTransaction: async (
    organizationId: string,
    data: CreateTransactionDto
  ): Promise<Transaction> => {
    const response = await apiClient.post<Transaction>(
      `/organizations/${organizationId}/transactions`,
      data
    );
    return response.data;
  },

  updateTransaction: async (
    organizationId: string,
    transactionId: string,
    data: UpdateTransactionDto
  ): Promise<Transaction> => {
    const response = await apiClient.patch<Transaction>(
      `/organizations/${organizationId}/transactions/${transactionId}`,
      data
    );
    return response.data;
  },

  deleteTransaction: async (
    organizationId: string,
    transactionId: string
  ): Promise<void> => {
    await apiClient.delete(
      `/organizations/${organizationId}/transactions/${transactionId}`
    );
  },
};
