<template>
  <AppLayout>
    <div class="reports-view">
      
      
      
      

      <!-- Фильтры -->
      <div v-if="selectedReport" class="filters">
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
        <button @click="loadCurrentReport" class="btn-primary" :disabled="loading">
          {{ loading ? 'Загрузка...' : 'Обновить' }}
        </button>
      </div>

      <!-- Контент отчетов -->
      <div v-if="loading" class="loading">Загрузка отчета...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="!selectedReport" class="no-report-selected">
        Выберите отчет из списка выше
      </div>

      <!-- Компоненты отчетов -->
      <BalanceReport v-if="selectedReport?.id === 'balance'" :report="balanceReport" />
      <ProfitLossReport v-else-if="selectedReport?.id === 'profit-loss'" :report="profitLossReport" />
      <CashFlowReport v-else-if="selectedReport?.id === 'cash-flow'" :report="cashFlowReport" />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import BalanceReport from './reports/BalanceReport.vue';
import ProfitLossReport from './reports/ProfitLossReport.vue';
import CashFlowReport from './reports/CashFlowReport.vue';
import {
  reportsApi,
  type BalanceReport as BalanceReportType,
  type ProfitLossReport as ProfitLossReportType,
  type CashFlowReport as CashFlowReportType,
} from '../api/reports.api';
import { formatApiError } from '../utils/errorHandler';

const route = useRoute();
const router = useRouter();
const organizationId = computed(() => route.params.organizationId as string);

// Список доступных отчетов
const availableReports = [
  { id: 'balance', label: 'Баланс', component: 'BalanceReport' },
  { id: 'profit-loss', label: 'Отчет о прибылях и убытках', component: 'ProfitLossReport' },
  { id: 'cash-flow', label: 'Отчет о движении денежных средств', component: 'CashFlowReport' },
];

// Получаем выбранный отчет из query параметра
const reportType = computed(() => (route.query.report as string) || 'balance');
const selectedReport = computed(() => {
  return availableReports.find((r) => r.id === reportType.value) || availableReports[0];
});

const loading = ref(false);
const error = ref('');

const balanceReport = ref<BalanceReportType | null>(null);
const profitLossReport = ref<ProfitLossReportType | null>(null);
const cashFlowReport = ref<CashFlowReportType | null>(null);

// Устанавливаем период по умолчанию (текущий месяц)
const today = new Date();
const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const filters = ref({
  dateFrom: firstDayOfMonth.toISOString().split('T')[0],
  dateTo: lastDayOfMonth.toISOString().split('T')[0],
  includeInactive: false,
});

// Если нет query параметра, устанавливаем первый отчет по умолчанию
if (!route.query.report) {
  router.replace({
    query: { report: 'balance' },
  });
}

const loadCurrentReport = async () => {
  if (!selectedReport.value) return;

  loading.value = true;
  error.value = '';

  try {
    const params = {
      dateFrom: filters.value.dateFrom || undefined,
      dateTo: filters.value.dateTo || undefined,
      includeInactive: filters.value.includeInactive,
    };

    if (selectedReport.value.id === 'balance') {
      balanceReport.value = await reportsApi.getBalanceReport(organizationId.value, params);
    } else if (selectedReport.value.id === 'profit-loss') {
      if (!params.dateFrom || !params.dateTo) {
        error.value = 'Для отчета о прибылях и убытках необходимо указать период';
        return;
      }
      profitLossReport.value = await reportsApi.getProfitLossReport(organizationId.value, params);
    } else if (selectedReport.value.id === 'cash-flow') {
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

// Загружаем отчет при изменении типа отчета
watch(
  () => route.query.report,
  () => {
    // Очищаем предыдущие отчеты
    balanceReport.value = null;
    profitLossReport.value = null;
    cashFlowReport.value = null;
    error.value = '';
    loadCurrentReport();
  },
  { immediate: true }
);

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
  height: fit-content;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading,
.error-message,
.no-report-selected {
  text-align: center;
  padding: 40px;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-message {
  background: #fee;
  color: #c33;
}

.no-report-selected {
  font-style: italic;
}
</style>
