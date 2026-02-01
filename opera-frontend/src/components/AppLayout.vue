<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-content">
        <h1 class="logo">Opera ERP</h1>
        <div class="header-actions">
          <div
            v-if="organizations.length > 0"
            class="org-selector-wrapper"
          >
            <button
              @click.stop="showOrgDropdown = !showOrgDropdown"
              class="org-select-button"
              :class="{ active: showOrgDropdown }"
            >
              {{ currentOrganization?.name || 'Выберите организацию' }}
              <span class="dropdown-arrow">▼</span>
            </button>
            <div v-if="showOrgDropdown" class="org-dropdown-menu" @click.stop>
              <button
                v-for="org in organizations"
                :key="org.id"
                @click.stop="selectOrganization(org.id)"
                class="org-dropdown-item"
                :class="{ active: currentOrganizationId === org.id }"
              >
                {{ org.name }}
              </button>
              <div class="org-dropdown-divider"></div>
              <button
                @click.stop="showCreateOrgModal = true; showOrgDropdown = false"
                class="org-dropdown-item create-org"
              >
                + Создать организацию
              </button>
            </div>
          </div>
          <button @click="handleLogout" class="btn-logout">Выйти</button>
        </div>

        <!-- Модальное окно создания организации -->
        <Modal
          v-model="showCreateOrgModal"
          title="Создать организацию"
          @update:modelValue="showCreateOrgModal = false; createOrgError = ''; newOrgName = ''"
        >
          <form @submit.prevent="handleCreateOrganization">
              <div class="form-group">
                <label>Название организации</label>
                <input
                  v-model="newOrgName"
                  type="text"
                  required
                  placeholder="ООО Пример"
                  class="form-input"
                />
              </div>
            <div v-if="createOrgError" class="error-message">{{ createOrgError }}</div>
            <div class="modal-actions">
              <button
                type="button"
                @click="showCreateOrgModal = false; createOrgError = ''; newOrgName = ''"
                class="btn-secondary"
              >
                Отмена
              </button>
              <button type="submit" :disabled="createOrgLoading" class="btn-primary">
                {{ createOrgLoading ? 'Создание...' : 'Создать' }}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </header>

    <div class="layout-body">
      <Sidebar />
      <div class="content-wrapper">
        <TabsBar />
        <main class="app-main">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useOrganizationsStore } from '../stores/organizations';
import { useTabsStore } from '../stores/tabs';
import { formatApiError } from '../utils/errorHandler';
import TabsBar from './TabsBar.vue';
import Sidebar from './Sidebar.vue';
import Modal from './Modal.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const organizationsStore = useOrganizationsStore();
const tabsStore = useTabsStore();

const organizations = computed(() => organizationsStore.organizations);
const currentOrganizationId = computed(
  () => organizationsStore.currentOrganizationId
);
const currentOrganization = computed(
  () => organizationsStore.currentOrganization
);

const showReportsDropdown = ref(false);
const showOrgDropdown = ref(false);
const showCreateOrgModal = ref(false);
const newOrgName = ref('');
const createOrgLoading = ref(false);
const createOrgError = ref('');

const selectedReportType = computed(() => route.query.report as string | undefined);
const isReportsPage = computed(() => route.path.includes('/reports'));

// Список доступных отчетов
const availableReports = [
  { id: 'balance', label: 'Баланс' },
  { id: 'profit-loss', label: 'Отчет о прибылях и убытках' },
  { id: 'cash-flow', label: 'Отчет о движении денежных средств' },
];

// Закрытие выпадающего меню при клике вне его
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  
  // Проверяем, что клик был вне выпадающего меню отчетов
  // Проверяем как обертку, так и само меню
  const reportsWrapper = target.closest('.nav-dropdown-wrapper');
  const reportsMenu = target.closest('.nav-dropdown-menu');
  
  if (showReportsDropdown.value && !reportsWrapper && !reportsMenu) {
    showReportsDropdown.value = false;
  }
  
  // Проверяем, что клик был вне выпадающего меню организаций
  // Проверяем как обертку, так и само меню
  const orgWrapper = target.closest('.org-selector-wrapper');
  const orgMenu = target.closest('.org-dropdown-menu');
  
  if (showOrgDropdown.value && !orgWrapper && !orgMenu) {
    showOrgDropdown.value = false;
  }
};

const selectOrganization = (organizationId: string) => {
  organizationsStore.setCurrentOrganization(organizationId);
  showOrgDropdown.value = false;
  router.push('/');
};

const handleCreateOrganization = async () => {
  if (!newOrgName.value.trim()) {
    createOrgError.value = 'Введите название организации';
    return;
  }

  createOrgLoading.value = true;
  createOrgError.value = '';

  try {
    await organizationsStore.createOrganization({ name: newOrgName.value });
    showCreateOrgModal.value = false;
    newOrgName.value = '';
    router.push('/');
  } catch (err: any) {
    createOrgError.value = formatApiError(err);
  } finally {
    createOrgLoading.value = false;
  }
};

const handleLogout = () => {
  authStore.logout();
};

// Маппинг маршрутов на названия вкладок
const routeTitles: Record<string, (params: any, query: any) => string> = {
  home: () => 'Главная',
  accounts: (params: any) => `Счета`,
  transactions: (params: any) => `Проводки`,
  reports: (params: any, query: any) => {
    const reportTitles: Record<string, string> = {
      balance: 'Баланс',
      'profit-loss': 'Прибыли и убытки',
      'cash-flow': 'Движение денежных средств',
    };
    const reportType = query.report || 'balance';
    return reportTitles[reportType] || 'Отчеты';
  },
};

// Отслеживаем изменения маршрута и добавляем вкладки
watch(
  () => route.fullPath,
  (newPath) => {
    const routeName = route.name as string;
    // Пропускаем страницы логина и регистрации
    if (!routeName || routeName === 'login' || routeName === 'register') {
      return;
    }

    // Для страницы отчетов создаем вкладку только если выбран конкретный отчет
    if (routeName === 'reports' && !route.query.report) {
      return;
    }

    const getTitle = routeTitles[routeName];
    const title = getTitle ? getTitle(route.params, route.query) : routeName;

    // Определяем, можно ли закрыть вкладку (главную нельзя закрыть)
    const closable = routeName !== 'home';

    // Создаем уникальный ID для вкладки на основе пути
    const tabId = route.fullPath;

    tabsStore.addTab({
      id: tabId,
      title,
      path: route.fullPath,
      routeName,
      closable,
    });
  },
  { immediate: true }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: visible;
  align-items: flex-start;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  min-width: 0;
  position: relative;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #667eea;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 100%;
  margin: 0;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 20px;
  width: 100%;
}

.logo {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.nav {
  display: flex;
  gap: 20px;
  flex: 1;
  margin-left: 40px;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: background 0.2s;
  font-weight: 500;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active,
.nav-link.active {
  background: rgba(255, 255, 255, 0.2);
}

.nav-dropdown-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.nav-link .dropdown-arrow {
  font-size: 10px;
  margin-left: 6px;
  transition: transform 0.2s;
}

.nav-dropdown-wrapper:hover .nav-link .dropdown-arrow,
.nav-dropdown-wrapper .nav-link.active .dropdown-arrow {
  transform: rotate(180deg);
}

.nav-dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 280px;
  overflow: hidden;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  text-align: left;
  border: none;
  background: white;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.dropdown-item.active {
  background: #667eea;
  color: white;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.org-selector-wrapper {
  position: relative;
}

.org-select-button {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  justify-content: space-between;
  transition: all 0.2s;
}

.org-select-button:hover {
  background: rgba(255, 255, 255, 0.15);
}

.org-select-button.active {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.org-select-button .dropdown-arrow {
  font-size: 10px;
  transition: transform 0.2s;
}

.org-select-button.active .dropdown-arrow {
  transform: rotate(180deg);
}

.org-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1001;
  min-width: 250px;
  max-width: 300px;
  overflow: hidden;
}

.org-dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  text-align: left;
  border: none;
  background: white;
  cursor: pointer;
}

.org-dropdown-item:hover {
  background: #f5f5f5;
}

.org-dropdown-item.active {
  background: #667eea;
  color: white;
}

.org-dropdown-item.create-org {
  color: #667eea;
  font-weight: 600;
}

.org-dropdown-item.create-org:hover {
  background: #f0f4ff;
}

.org-dropdown-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 4px 0;
}

.btn-logout {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  padding-top: 20px;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-secondary {
  padding: 10px 20px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #e0e0e0;
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

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
