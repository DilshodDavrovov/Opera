<template>
  <div class="report-content">
    <div class="report-header">
      <h2>Отчет о движении денежных средств</h2>
      <p class="report-period">
        {{ formatPeriod(report?.dateFrom || null, report?.dateTo || null) }}
      </p>
    </div>

    <div v-if="!report" class="no-data">Выберите период и нажмите "Обновить"</div>

    <template v-else>
      <!-- Операционная деятельность -->
      <div class="report-section">
        <h3>{{ report.operating.category }}</h3>
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
            <tr v-for="item in report.operating.items" :key="item.accountId">
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
              <td class="text-right"><strong>{{ formatAmount(report.operating.totalInflow) }}</strong></td>
              <td class="text-right"><strong>{{ formatAmount(report.operating.totalOutflow) }}</strong></td>
              <td class="text-right"><strong>{{ formatAmount(report.operating.netFlow) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Инвестиционная деятельность -->
      <div class="report-section">
        <h3>{{ report.investing.category }}</h3>
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
            <tr v-for="item in report.investing.items" :key="item.accountId">
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
              <td class="text-right"><strong>{{ formatAmount(report.investing.totalInflow) }}</strong></td>
              <td class="text-right"><strong>{{ formatAmount(report.investing.totalOutflow) }}</strong></td>
              <td class="text-right"><strong>{{ formatAmount(report.investing.netFlow) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Финансовая деятельность -->
      <div class="report-section">
        <h3>{{ report.financing.category }}</h3>
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
            <tr v-for="item in report.financing.items" :key="item.accountId">
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
              <td class="text-right"><strong>{{ formatAmount(report.financing.totalInflow) }}</strong></td>
              <td class="text-right"><strong>{{ formatAmount(report.financing.totalOutflow) }}</strong></td>
              <td class="text-right"><strong>{{ formatAmount(report.financing.netFlow) }}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Итоги Cash Flow -->
      <div class="report-summary">
        <div class="summary-row">
          <strong>Баланс на начало периода:</strong>
          <strong>{{ formatAmount(report.openingBalance) }}</strong>
        </div>
        <div class="summary-row">
          <strong>Чистый денежный поток:</strong>
          <strong :class="report.netCashFlow >= 0 ? 'amount-positive' : 'amount-negative'">
            {{ formatAmount(report.netCashFlow) }}
          </strong>
        </div>
        <div class="summary-row total">
          <strong>Баланс на конец периода:</strong>
          <strong>{{ formatAmount(report.closingBalance) }}</strong>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import type { CashFlowReport } from '../../api/reports.api';

const props = defineProps<{
  report: CashFlowReport | null;
}>();

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
</script>

<style scoped>
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

.no-data {
  text-align: center;
  padding: 40px;
  color: #666;
  font-style: italic;
}
</style>
