<template>
  <AppLayout>
    <div class="reports-view">
      <div class="page-header">
        <h1>Финансовые отчеты</h1>
      </div>

      <!-- Фильтры -->
      <div class="filters">
        <div class="filter-group">
          <label>Период с</label>
          <input
            v-model="filters.dateFrom"
            type="date"
            class="filter-input"
            @change="loadCurrentReport"
          />
        </div>
        <div class="filter-group">
          <label>Период по</label>
          <input
            v-model="filters.dateTo"
            type="date"
            class="filter-input"
            @change="loadCurrentReport"
          />
        </div>
        <div class="filter-group">
          <label class="checkbox-label">
            <input
              v-model="filters.includeInactive"
              type="checkbox"
              @change="loadCurrentReport"
            />
            Включить неактивные счета
          </label>
        </div>
        <button @click="loadCurrentReport" class="btn-primary">Обновить</button>
      </div>

      <!-- Вкладки -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id; loadCurrentReport()"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Контент отчетов -->
      <div v-if="loading" class="loading">Загрузка отчета...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>

      <!-- Баланс -->
      <div v-else-if="activeTab === 'balance' && balanceReport" class="report-content">
        <div class="report-header">
          <h2>Баланс</h2>
          <p class="report-period">
            {{ formatPeriod(balanceReport.dateFrom, balanceReport.dateTo) }}
          </p>
        </div>

        <!-- Активы -->
        <div class="report-section">
          <h3>{{ balanceReport.assets.typeLabel }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Начальный остаток</th>
                <th class="text-right">Дебет</th>
                <th class="text-right">Кредит</th>
                <th class="text-right">Конечный остаток</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in balanceReport.assets.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right">{{ formatAmount(item.openingBalance) }}</td>
                <td class="text-right">{{ formatAmount(item.debit) }}</td>
                <td class="text-right">{{ formatAmount(item.credit) }}</td>
                <td class="text-right amount-positive">{{ formatAmount(item.closingBalance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого активы</strong></td>
                <td class="text-right">{{ formatAmount(balanceReport.assets.items.reduce((s, i) => s + i.openingBalance, 0)) }}</td>
                <td class="text-right">{{ formatAmount(balanceReport.assets.items.reduce((s, i) => s + i.debit, 0)) }}</td>
                <td class="text-right">{{ formatAmount(balanceReport.assets.items.reduce((s, i) => s + i.credit, 0)) }}</td>
                <td class="text-right"><strong>{{ formatAmount(balanceReport.assets.total) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Пассивы -->
        <div class="report-section">
          <h3>{{ balanceReport.liabilities.typeLabel }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Начальный остаток</th>
                <th class="text-right">Дебет</th>
                <th class="text-right">Кредит</th>
                <th class="text-right">Конечный остаток</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in balanceReport.liabilities.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right">{{ formatAmount(item.openingBalance) }}</td>
                <td class="text-right">{{ formatAmount(item.debit) }}</td>
                <td class="text-right">{{ formatAmount(item.credit) }}</td>
                <td class="text-right amount-positive">{{ formatAmount(item.closingBalance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого пассивы</strong></td>
                <td class="text-right">{{ formatAmount(balanceReport.liabilities.items.reduce((s, i) => s + i.openingBalance, 0)) }}</td>
                <td class="text-right">{{ formatAmount(balanceReport.liabilities.items.reduce((s, i) => s + i.debit, 0)) }}</td>
                <td class="text-right">{{ formatAmount(balanceReport.liabilities.items.reduce((s, i) => s + i.credit, 0)) }}</td>
                <td class="text-right"><strong>{{ formatAmount(balanceReport.liabilities.total) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Капитал -->
        <div class="report-section">
          <h3>{{ balanceReport.equity.typeLabel }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Начальный остаток</th>
                <th class="text-right">Дебет</th>
                <th class="text-right">Кредит</th>
                <th class="text-right">Конечный остаток</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in balanceReport.equity.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right">{{ formatAmount(item.openingBalance) }}</td>
                <td class="text-right">{{ formatAmount(item.debit) }}</td>
                <td class="text-right">{{ formatAmount(item.credit) }}</td>
                <td class="text-right amount-positive">{{ formatAmount(item.closingBalance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого капитал</strong></td>
                <td class="text-right">{{ formatAmount(balanceReport.equity.items.reduce((s, i) => s + i.openingBalance, 0)) }}</td>
                <td class="text-right">{{ formatAmount(balanceReport.equity.items.reduce((s, i) => s + i.debit, 0)) }}</td>
                <td class="text-right">{{ formatAmount(balanceReport.equity.items.reduce((s, i) => s + i.credit, 0)) }}</td>
                <td class="text-right"><strong>{{ formatAmount(balanceReport.equity.total) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Итоги баланса -->
        <div class="report-summary">
          <div class="summary-row">
            <strong>Итого активы:</strong>
            <strong>{{ formatAmount(balanceReport.totalAssets) }}</strong>
          </div>
          <div class="summary-row">
            <strong>Итого пассивы и капитал:</strong>
            <strong>{{ formatAmount(balanceReport.totalLiabilitiesAndEquity) }}</strong>
          </div>
        </div>
      </div>

      <!-- Отчет о прибылях и убытках -->
      <div v-else-if="activeTab === 'profit-loss' && profitLossReport" class="report-content">
        <div class="report-header">
          <h2>Отчет о прибылях и убытках</h2>
          <p class="report-period">
            {{ formatPeriod(profitLossReport.dateFrom, profitLossReport.dateTo) }}
          </p>
        </div>

        <!-- Доходы -->
        <div class="report-section">
          <h3>{{ profitLossReport.revenue.typeLabel }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Дебет</th>
                <th class="text-right">Кредит</th>
                <th class="text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in profitLossReport.revenue.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right">{{ formatAmount(item.debit) }}</td>
                <td class="text-right">{{ formatAmount(item.credit) }}</td>
                <td class="text-right amount-positive">{{ formatAmount(item.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого доходы</strong></td>
                <td class="text-right">{{ formatAmount(profitLossReport.revenue.items.reduce((s, i) => s + i.debit, 0)) }}</td>
                <td class="text-right">{{ formatAmount(profitLossReport.revenue.items.reduce((s, i) => s + i.credit, 0)) }}</td>
                <td class="text-right"><strong>{{ formatAmount(profitLossReport.revenue.total) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Расходы -->
        <div class="report-section">
          <h3>{{ profitLossReport.expenses.typeLabel }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Дебет</th>
                <th class="text-right">Кредит</th>
                <th class="text-right">Сумма</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in profitLossReport.expenses.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right">{{ formatAmount(item.debit) }}</td>
                <td class="text-right">{{ formatAmount(item.credit) }}</td>
                <td class="text-right amount-negative">{{ formatAmount(item.balance) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого расходы</strong></td>
                <td class="text-right">{{ formatAmount(profitLossReport.expenses.items.reduce((s, i) => s + i.debit, 0)) }}</td>
                <td class="text-right">{{ formatAmount(profitLossReport.expenses.items.reduce((s, i) => s + i.credit, 0)) }}</td>
                <td class="text-right"><strong>{{ formatAmount(profitLossReport.expenses.total) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Итоги P&L -->
        <div class="report-summary">
          <div class="summary-row">
            <strong>Доходы:</strong>
            <strong class="amount-positive">{{ formatAmount(profitLossReport.revenue.total) }}</strong>
          </div>
          <div class="summary-row">
            <strong>Расходы:</strong>
            <strong class="amount-negative">{{ formatAmount(profitLossReport.expenses.total) }}</strong>
          </div>
          <div class="summary-row total">
            <strong>Чистая прибыль:</strong>
            <strong :class="profitLossReport.netProfit >= 0 ? 'amount-positive' : 'amount-negative'">
              {{ formatAmount(profitLossReport.netProfit) }}
            </strong>
          </div>
        </div>
      </div>

      <!-- Движение денежных средств -->
      <div v-else-if="activeTab === 'cash-flow' && cashFlowReport" class="report-content">
        <div class="report-header">
          <h2>Отчет о движении денежных средств</h2>
          <p class="report-period">
            {{ formatPeriod(cashFlowReport.dateFrom, cashFlowReport.dateTo) }}
          </p>
        </div>

        <!-- Операционная деятельность -->
        <div class="report-section">
          <h3>{{ cashFlowReport.operating.category }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Поступления</th>
                <th class="text-right">Выплаты</th>
                <th class="text-right">Чистый поток</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cashFlowReport.operating.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right amount-positive">{{ formatAmount(item.inflow) }}</td>
                <td class="text-right amount-negative">{{ formatAmount(item.outflow) }}</td>
                <td class="text-right" :class="item.netFlow >= 0 ? 'amount-positive' : 'amount-negative'">
                  {{ formatAmount(item.netFlow) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого операционная деятельность</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.operating.totalInflow) }}</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.operating.totalOutflow) }}</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.operating.netFlow) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Инвестиционная деятельность -->
        <div class="report-section">
          <h3>{{ cashFlowReport.investing.category }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Поступления</th>
                <th class="text-right">Выплаты</th>
                <th class="text-right">Чистый поток</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cashFlowReport.investing.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right amount-positive">{{ formatAmount(item.inflow) }}</td>
                <td class="text-right amount-negative">{{ formatAmount(item.outflow) }}</td>
                <td class="text-right" :class="item.netFlow >= 0 ? 'amount-positive' : 'amount-negative'">
                  {{ formatAmount(item.netFlow) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого инвестиционная деятельность</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.investing.totalInflow) }}</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.investing.totalOutflow) }}</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.investing.netFlow) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Финансовая деятельность -->
        <div class="report-section">
          <h3>{{ cashFlowReport.financing.category }}</h3>
          <table class="report-table">
            <thead>
              <tr>
                <th>Код</th>
                <th>Название</th>
                <th class="text-right">Поступления</th>
                <th class="text-right">Выплаты</th>
                <th class="text-right">Чистый поток</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cashFlowReport.financing.items" :key="item.accountId">
                <td>{{ item.accountCode }}</td>
                <td>{{ item.accountName }}</td>
                <td class="text-right amount-positive">{{ formatAmount(item.inflow) }}</td>
                <td class="text-right amount-negative">{{ formatAmount(item.outflow) }}</td>
                <td class="text-right" :class="item.netFlow >= 0 ? 'amount-positive' : 'amount-negative'">
                  {{ formatAmount(item.netFlow) }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="2"><strong>Итого финансовая деятельность</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.financing.totalInflow) }}</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.financing.totalOutflow) }}</strong></td>
                <td class="text-right"><strong>{{ formatAmount(cashFlowReport.financing.netFlow) }}</strong></td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Итоги Cash Flow -->
        <div class="report-summary">
          <div class="summary-row">
            <strong>Баланс на начало периода:</strong>
            <strong>{{ formatAmount(cashFlowReport.openingBalance) }}</strong>
          </div>
          <div class="summary-row">
            <strong>Чистый денежный поток:</strong>
            <strong :class="cashFlowReport.netCashFlow >= 0 ? 'amount-positive' : 'amount-negative'">
              {{ formatAmount(cashFlowReport.netCashFlow) }}
            </strong>
          </div>
          <div class="summary-row total">
            <strong>Баланс на конец периода:</strong>
            <strong>{{ formatAmount(cashFlowReport.closingBalance) }}</strong>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { reportsApi, type BalanceReport, type ProfitLossReport, type CashFlowReport } from '../api/reports.api';
import { formatApiError } from '../utils/errorHandler';

const route = useRoute();
const organizationId = computed(() => route.params.organizationId as string);

const activeTab = ref<'balance' | 'profit-loss' | 'cash-flow'>('balance');
const loading = ref(false);
const error = ref('');

const balanceReport = ref<BalanceReport | null>(null);
const profitLossReport = ref<ProfitLossReport | null>(null);
const cashFlowReport = ref<CashFlowReport | null>(null);

const tabs = [
  { id: 'balance' as const, label: 'Баланс' },
  { id: 'profit-loss' as const, label: 'Прибыли и убытки' },
  { id: 'cash-flow' as const, label: 'Движение денежных средств' },
];

// Устанавливаем период по умолчанию (текущий месяц)
const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const filters = ref({
  dateFrom: firstDayOfMonth.toISOString().split('T')[0],
  dateTo: lastDayOfMonth.toISOString().split('T')[0],
  includeInactive: false,
});

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatPeriod = (dateFrom: string | null, dateTo: string | null): string => {
  if (!dateFrom && !dateTo) {
    return 'За весь период';
  }
  const from = dateFrom ? new Date(dateFrom).toLocaleDateString('ru-RU') : 'начала';
  const to = dateTo ? new Date(dateTo).toLocaleDateString('ru-RU') : 'конца';
  return `Период: с ${from} по ${to}`;
};

const loadCurrentReport = async () => {
  loading.value = true;
  error.value = '';

  try {
    const params = {
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
      includeInactive: filters.value.includeInactive,
    };

    if (activeTab.value === 'balance') {
      balanceReport.value = await reportsApi.getBalanceReport(organizationId.value, params);
    } else if (activeTab.value === 'profit-loss') {
      if (!params.dateFrom || !params.dateTo) {
        error.value = 'Для отчета о прибылях и убытках необходимо указать период';
        return;
      }
      profitLossReport.value = await reportsApi.getProfitLossReport(organizationId.value, params);
    } else if (activeTab.value === 'cash-flow') {
      if (!params.dateFrom || !params.dateTo) {
        error.value = 'Для отчета о движении денежных средств необходимо указать период';
        return;
      }
      cashFlowReport.value = await reportsApi.getCashFlowReport(organizationId.value, params);
    }
  } catch (err: any) {
    error.value = formatApiError(err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadCurrentReport();
});
</script>

<style scoped>
.reports-view {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #333;
  margin: 0;
}

.filters {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #555;
}

.filter-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  border-bottom: 2px solid #e0e0e0;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s;
}

.tab-button:hover {
  color: #667eea;
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.report-content {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.report-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
}

.report-header h2 {
  color: #333;
  margin: 0 0 8px 0;
}

.report-period {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.report-section {
  margin-bottom: 40px;
}

.report-section h3 {
  color: #667eea;
  margin: 0 0 16px 0;
  font-size: 18px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.report-table thead {
  background: #f5f5f5;
}

.report-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e0e0e0;
}

.report-table th.text-right {
  text-align: right;
}

.report-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.report-table tbody tr:hover {
  background: #f9f9f9;
}

.report-table tfoot {
  border-top: 2px solid #e0e0e0;
}

.report-table tfoot .total-row {
  background: #f5f5f5;
  font-weight: 600;
}

.text-right {
  text-align: right;
}

.amount-positive {
  color: #22c55e;
}

.amount-negative {
  color: #ef4444;
}

.report-summary {
  margin-top: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-row.total {
  border-top: 2px solid #667eea;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 18px;
}

.loading,
.error-message {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error-message {
  background: #fee;
  color: #c33;
  border-radius: 8px;
}

.btn-primary {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #5568d3;
}
</style>
