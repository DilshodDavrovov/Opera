<template>
  <AppLayout>
    <div class="transactions-view">
      <div class="page-header">
        <h1>Проводки</h1>
        <button @click="showCreateModal = true" class="btn-primary">
          Создать проводку
        </button>
      </div>

      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="transactions.length === 0" class="empty-state">
        <p>Проводок пока нет. Создайте первую проводку.</p>
      </div>
      <table v-else class="transactions-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Дебет</th>
            <th>Кредит</th>
            <th>Сумма</th>
            <th>Описание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ formatDate(transaction.date) }}</td>
            <td>{{ getAccountName(transaction.debitAccountId) }}</td>
            <td>{{ getAccountName(transaction.creditAccountId) }}</td>
            <td>{{ formatAmount(transaction.amount) }}</td>
            <td>{{ transaction.description || '-' }}</td>
            <td>
              <button @click="editTransaction(transaction)" class="btn-edit">Изменить</button>
              <button @click="deleteTransaction(transaction.id)" class="btn-delete">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal для создания/редактирования -->
      <div v-if="showCreateModal || editingTransaction" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>{{ editingTransaction ? 'Изменить проводку' : 'Создать проводку' }}</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Счет дебета</label>
              <select v-model="form.debitAccountId" required>
                <option value="">Выберите счет</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.code }} - {{ account.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Счет кредита</label>
              <select v-model="form.creditAccountId" required>
                <option value="">Выберите счет</option>
                <option v-for="account in accounts" :key="account.id" :value="account.id">
                  {{ account.code }} - {{ account.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Сумма</label>
              <input v-model.number="form.amount" type="number" step="0.01" min="0.01" required />
            </div>
            <div class="form-group">
              <label>Описание</label>
              <input v-model="form.description" type="text" placeholder="Описание проводки" />
            </div>
            <div class="form-group">
              <label>Дата</label>
              <input v-model="form.date" type="date" required />
            </div>
            <div v-if="formError" class="error-message">{{ formError }}</div>
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-secondary">Отмена</button>
              <button type="submit" :disabled="submitting" class="btn-primary">
                {{ submitting ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import {
  accountingApi,
  type Transaction,
  type CreateTransactionDto,
  type Account,
} from '../api/accounting.api';

const route = useRoute();
const organizationId = computed(() => route.params.organizationId as string);

const transactions = ref<Transaction[]>([]);
const accounts = ref<Account[]>([]);
const loading = ref(false);
const error = ref('');
const showCreateModal = ref(false);
const editingTransaction = ref<Transaction | null>(null);
const submitting = ref(false);
const formError = ref('');

const form = ref<CreateTransactionDto>({
  debitAccountId: '',
  creditAccountId: '',
  amount: 0,
  description: '',
  date: new Date().toISOString().split('T')[0],
});

onMounted(() => {
  loadData();
});

const loadData = async () => {
  loading.value = true;
  error.value = '';
  try {
    [transactions.value, accounts.value] = await Promise.all([
      accountingApi.getTransactions(organizationId.value),
      accountingApi.getAccounts(organizationId.value),
    ]);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки данных';
  } finally {
    loading.value = false;
  }
};

const getAccountName = (accountId: string): string => {
  const account = accounts.value.find((a) => a.id === accountId);
  return account ? `${account.code} - ${account.name}` : accountId;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('ru-RU');
};

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
  }).format(amount);
};

const editTransaction = (transaction: Transaction) => {
  editingTransaction.value = transaction;
  form.value = {
    debitAccountId: transaction.debitAccountId,
    creditAccountId: transaction.creditAccountId,
    amount: transaction.amount,
    description: transaction.description || '',
    date: transaction.date.split('T')[0],
  };
  showCreateModal.value = true;
};

const deleteTransaction = async (transactionId: string) => {
  if (!confirm('Вы уверены, что хотите удалить эту проводку?')) return;

  try {
    await accountingApi.deleteTransaction(organizationId.value, transactionId);
    await loadData();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка удаления проводки');
  }
};

const handleSubmit = async () => {
  if (form.value.debitAccountId === form.value.creditAccountId) {
    formError.value = 'Дебет и кредит не могут совпадать';
    return;
  }

  submitting.value = true;
  formError.value = '';

  try {
    if (editingTransaction.value) {
      await accountingApi.updateTransaction(
        organizationId.value,
        editingTransaction.value.id,
        form.value
      );
    } else {
      await accountingApi.createTransaction(organizationId.value, form.value);
    }
    closeModal();
    await loadData();
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Ошибка сохранения проводки';
  } finally {
    submitting.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingTransaction.value = null;
  form.value = {
    debitAccountId: '',
    creditAccountId: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
  };
  formError.value = '';
};
</script>

<style scoped>
.transactions-view {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

h1 {
  color: #333;
  margin: 0;
}

.loading,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.transactions-table thead {
  background: #f5f5f5;
}

.transactions-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
}

.transactions-table td {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-edit {
  background: #667eea;
  color: white;
}

.btn-edit:hover {
  background: #5568d3;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  margin: 0 0 20px 0;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}
</style>
