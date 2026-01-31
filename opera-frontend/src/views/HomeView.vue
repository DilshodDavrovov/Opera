<template>
  <AppLayout>
    <div class="home-view">
      <h1>Добро пожаловать в Opera ERP</h1>

      <div v-if="!currentOrganization" class="no-org-message">
        <p>У вас нет активной организации.</p>
        <button @click="showCreateModal = true" class="btn-primary">
          Создать организацию
        </button>
      </div>

      <div v-else class="org-info">
        <h2>Текущая организация: {{ currentOrganization.name }}</h2>
        <div class="quick-actions">
          <router-link
            :to="`/organizations/${currentOrganization.id}/accounts`"
            class="action-card"
          >
            <h3>Счета</h3>
            <p>Управление бухгалтерскими счетами</p>
          </router-link>
          <router-link
            :to="`/organizations/${currentOrganization.id}/transactions`"
            class="action-card"
          >
            <h3>Проводки</h3>
            <p>Создание и управление проводками</p>
          </router-link>
          <router-link
            :to="`/organizations/${currentOrganization.id}/reports`"
            class="action-card"
          >
            <h3>Отчеты</h3>
            <p>Баланс, прибыли и убытки, движение денежных средств</p>
          </router-link>
        </div>
      </div>

      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal-content" @click.stop>
          <h2>Создать организацию</h2>
          <form @submit.prevent="handleCreateOrganization">
            <div class="form-group">
              <label>Название организации</label>
              <input
                v-model="newOrgName"
                type="text"
                required
                placeholder="ООО Пример"
              />
            </div>
            <div v-if="error" class="error-message">{{ error }}</div>
            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn-secondary">
                Отмена
              </button>
              <button type="submit" :disabled="loading" class="btn-primary">
                {{ loading ? 'Создание...' : 'Создать' }}
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
import { useRouter } from 'vue-router';
import AppLayout from '../components/AppLayout.vue';
import { useOrganizationsStore } from '../stores/organizations';
import { formatApiError } from '../utils/errorHandler';

const router = useRouter();
const organizationsStore = useOrganizationsStore();

const showCreateModal = ref(false);
const newOrgName = ref('');
const loading = ref(false);
const error = ref('');

const currentOrganization = computed(() => organizationsStore.currentOrganization);

onMounted(async () => {
  await organizationsStore.loadOrganizations();
});

const handleCreateOrganization = async () => {
  loading.value = true;
  error.value = '';

  try {
    await organizationsStore.createOrganization({ name: newOrgName.value });
    showCreateModal.value = false;
    newOrgName.value = '';
  } catch (err: any) {
    error.value = formatApiError(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.home-view {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.no-org-message {
  text-align: center;
  padding: 60px 20px;
  background: #f5f5f5;
  border-radius: 12px;
}

.no-org-message p {
  color: #666;
  margin-bottom: 20px;
  font-size: 18px;
}

.org-info h2 {
  color: #667eea;
  margin-bottom: 30px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 24px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.action-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
}

.action-card h3 {
  color: #667eea;
  margin: 0 0 8px 0;
}

.action-card p {
  color: #666;
  margin: 0;
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
  max-width: 400px;
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

.form-group input {
  width: 100%;
  padding: 12px;
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
