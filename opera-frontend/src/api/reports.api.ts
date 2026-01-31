import { apiClient } from './client';

export interface BalanceReportItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  openingBalance: number; // начальный остаток
  debit: number; // обороты по дебету за период
  credit: number; // обороты по кредиту за период
  closingBalance: number; // конечный остаток
}

export interface BalanceReportSection {
  type: 'ASSET' | 'LIABILITY' | 'EQUITY';
  typeLabel: string;
  items: BalanceReportItem[];
  total: number;
}

export interface BalanceReport {
  organizationId: string;
  dateFrom: string | null;
  dateTo: string | null;
  generatedAt: string;
  assets: BalanceReportSection;
  liabilities: BalanceReportSection;
  equity: BalanceReportSection;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
}

export interface ProfitLossReportItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface ProfitLossReportSection {
  type: 'REVENUE' | 'EXPENSE';
  typeLabel: string;
  items: ProfitLossReportItem[];
  total: number;
}

export interface ProfitLossReport {
  organizationId: string;
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  revenue: ProfitLossReportSection;
  expenses: ProfitLossReportSection;
  grossProfit: number;
  netProfit: number;
}

export interface CashFlowItem {
  accountId: string;
  accountCode: string;
  accountName: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

export interface CashFlowSection {
  category: string;
  items: CashFlowItem[];
  totalInflow: number;
  totalOutflow: number;
  netFlow: number;
}

export interface CashFlowReport {
  organizationId: string;
  dateFrom: string;
  dateTo: string;
  generatedAt: string;
  operating: CashFlowSection;
  investing: CashFlowSection;
  financing: CashFlowSection;
  totalInflow: number;
  totalOutflow: number;
  netCashFlow: number;
  openingBalance: number;
  closingBalance: number;
}

export interface ReportQueryParams {
  dateFrom?: string;
  dateTo?: string;
  includeInactive?: boolean;
}

export const reportsApi = {
  getBalanceReport: async (
    organizationId: string,
    params?: ReportQueryParams
  ): Promise<BalanceReport> => {
    const response = await apiClient.get<BalanceReport>(
      `/organizations/${organizationId}/reports/balance`,
      { params }
    );
    return response.data;
  },

  getProfitLossReport: async (
    organizationId: string,
    params: ReportQueryParams
  ): Promise<ProfitLossReport> => {
    const response = await apiClient.get<ProfitLossReport>(
      `/organizations/${organizationId}/reports/profit-loss`,
      { params }
    );
    return response.data;
  },

  getCashFlowReport: async (
    organizationId: string,
    params: ReportQueryParams
  ): Promise<CashFlowReport> => {
    const response = await apiClient.get<CashFlowReport>(
      `/organizations/${organizationId}/reports/cash-flow`,
      { params }
    );
    return response.data;
  },
};
