<template>
  <AppLayout>
    <div class="accounts-view">
      <div class="page-header">
        <h1>Бухгалтерские счета</h1>
        <button @click="showCreateModal = true" class="btn-primary">
          Создать счет
        </button>
      </div>

      <div v-if="loading" class="loading">Загрузка...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="accounts.length === 0" class="empty-state">
        <p>Счетов пока нет. Создайте первый счет.</p>
      </div>
      <table v-else class="accounts-table">
        <thead>
          <tr>
            <th>Код</th>
            <th>Название</th>
            <th>Тип</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="account in accounts" :key="account.id">
            <td>{{ account.code }}</td>
            <td>{{ account.name }}</td>
            <td>{{ accountTypeLabels[account.type] }}</td>
            <td>
              <span :class="account.isActive ? 'status-active' : 'status-inactive'">
                {{ account.isActive ? 'Активен' : 'Неактивен' }}
              </span>
            </td>
            <td>
              <button @click="editAccount(account)" class="btn-edit">Изменить</button>
              <button @click="deleteAccount(account.id)" class="btn-delete">Удалить</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal для создания/редактирования -->
      <div v-if="showCreateModal || editingAccount" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <h2>{{ editingAccount ? 'Изменить счет' : 'Создать счет' }}</h2>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>Код счета</label>
              <input v-model="form.code" type="text" required placeholder="01" />
            </div>
            <div class="form-group">
              <label>Название</label>
              <input v-model="form.name" type="text" required placeholder="Основные средства" />
            </div>
            <div class="form-group">
              <label>Тип счета</label>
              <select v-model="form.type" required>
                <option value="">Выберите тип</option>
                <option value="ASSET">Актив</option>
                <option value="LIABILITY">Пассив</option>
                <option value="EQUITY">Капитал</option>
                <option value="REVENUE">Доходы</option>
                <option value="EXPENSE">Расходы</option>
              </select>
            </div>
            <div class="form-group">
              <label>
                <input v-model="form.isActive" type="checkbox" />
                Активен
              </label>
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
import { accountingApi, type Account, type CreateAccountDto } from '../api/accounting.api';

const route = useRoute();
const organizationId = computed(() => route.params.organizationId as string);

const accounts = ref<Account[]>([]);
const loading = ref(false);
const error = ref('');
const showCreateModal = ref(false);
const editingAccount = ref<Account | null>(null);
const submitting = ref(false);
const formError = ref('');

const form = ref<CreateAccountDto>({
  code: '',
  name: '',
  type: 'ASSET',
  isActive: true,
});

const accountTypeLabels: Record<string, string> = {
  ASSET: 'Актив',
  LIABILITY: 'Пассив',
  EQUITY: 'Капитал',
  REVENUE: 'Доходы',
  EXPENSE: 'Расходы',
};

onMounted(() => {
  loadAccounts();
});

const loadAccounts = async () => {
  loading.value = true;
  error.value = '';
  try {
    accounts.value = await accountingApi.getAccounts(organizationId.value);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Ошибка загрузки счетов';
  } finally {
    loading.value = false;
  }
};

const editAccount = (account: Account) => {
  editingAccount.value = account;
  form.value = {
    code: account.code,
    name: account.name,
    type: account.type,
    isActive: account.isActive,
  };
  showCreateModal.value = true;
};

const deleteAccount = async (accountId: string) => {
  if (!confirm('Вы уверены, что хотите удалить этот счет?')) return;

  try {
    await accountingApi.deleteAccount(organizationId.value, accountId);
    await loadAccounts();
  } catch (err: any) {
    alert(err.response?.data?.message || 'Ошибка удаления счета');
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  formError.value = '';

  try {
    if (editingAccount.value) {
      await accountingApi.updateAccount(
        organizationId.value,
        editingAccount.value.id,
        form.value
      );
    } else {
      await accountingApi.createAccount(organizationId.value, form.value);
    }
    closeModal();
    await loadAccounts();
  } catch (err: any) {
    formError.value = err.response?.data?.message || 'Ошибка сохранения счета';
  } finally {
    submitting.value = false;
  }
};

const closeModal = () => {
  showCreateModal.value = false;
  editingAccount.value = null;
  form.value = {
    code: '',
    name: '',
    type: 'ASSET',
    isActive: true,
  };
  formError.value = '';
};
</script>

<style scoped>
.accounts-view {
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

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.accounts-table thead {
  background: #f5f5f5;
}

.accounts-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
}

.accounts-table td {
  padding: 12px;
  border-top: 1px solid #e0e0e0;
}

.status-active {
  color: #22c55e;
  font-weight: 500;
}

.status-inactive {
  color: #999;
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

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
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
