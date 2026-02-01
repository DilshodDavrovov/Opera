<template>
  <aside ref="sidebarRef" class="sidebar" :class="{ collapsed: isCollapsed }">
    <div class="sidebar-content">
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" @click="handleNavClick">
          <span class="nav-icon">🏠</span>
          <span class="nav-label">Главная</span>
        </router-link>
        <router-link
          v-if="currentOrganizationId"
          :to="`/organizations/${currentOrganizationId}/accounts`"
          class="nav-item"
          @click="handleNavClick"
        >
          <span class="nav-icon">📊</span>
          <span class="nav-label">Счета</span>
        </router-link>
        <router-link
          v-if="currentOrganizationId"
          :to="`/organizations/${currentOrganizationId}/transactions`"
          class="nav-item"
          @click="handleNavClick"
        >
          <span class="nav-icon">💼</span>
          <span class="nav-label">Проводки</span>
        </router-link>
        <div
          v-if="currentOrganizationId"
          ref="reportsButtonRef"
          class="nav-item nav-dropdown-wrapper"
          :class="{ active: isReportsPage }"
          @click.stop.prevent="showReportsDropdown = !showReportsDropdown"
        >
          <span class="nav-icon">📈</span>
          <span class="nav-label">Отчеты</span>
          <div
            v-if="showReportsDropdown"
            ref="dropdownMenuRef"
            class="nav-dropdown-menu"
            :class="{ 'collapsed-menu': isCollapsed }"
            @click.stop
          >
            <router-link
              v-for="report in availableReports"
              :key="report.id"
              :to="`/organizations/${currentOrganizationId}/reports?report=${report.id}`"
              class="dropdown-item"
              :class="{ active: selectedReportType === report.id }"
              @click.stop="showReportsDropdown = false"
            >
              {{ report.label }}
            </router-link>
          </div>
        </div>
      </nav>
    </div>
    <button class="sidebar-toggle" @click="toggleSidebar" title="Свернуть/Развернуть">
      <span>{{ isCollapsed ? '▶' : '◀' }}</span>
    </button>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useOrganizationsStore } from '../stores/organizations';

const route = useRoute();
const organizationsStore = useOrganizationsStore();

const currentOrganizationId = computed(
  () => organizationsStore.currentOrganizationId
);
const isReportsPage = computed(() => route.path.includes('/reports'));
const selectedReportType = computed(() => route.query.report as string | undefined);

const showReportsDropdown = ref(false);
const isCollapsed = ref(false);
const dropdownMenuRef = ref<HTMLElement | null>(null);
const reportsButtonRef = ref<HTMLElement | null>(null);
const sidebarRef = ref<HTMLElement | null>(null);

const availableReports = [
  { id: 'balance', label: 'Баланс' },
  { id: 'profit-loss', label: 'Прибыли и убытки' },
  { id: 'cash-flow', label: 'Движение денежных средств' },
];

const toggleSidebar = async () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebarCollapsed', String(isCollapsed.value));
  // Обновляем позицию выпадающего меню при изменении состояния sidebar
  if (showReportsDropdown.value) {
    await nextTick();
    // Небольшая задержка для завершения анимации sidebar
    setTimeout(() => {
      updateDropdownPosition();
    }, 50);
  }
};

const handleNavClick = () => {
  // Закрываем выпадающее меню отчетов при переходе
  showReportsDropdown.value = false;
};

// Позиционирование выпадающего меню
watch(showReportsDropdown, async (isOpen) => {
  if (isOpen && reportsButtonRef.value && dropdownMenuRef.value && sidebarRef.value) {
    await nextTick();
    // Небольшая задержка для завершения рендеринга
    setTimeout(() => {
      updateDropdownPosition();
    }, 10);
  }
});

// Обновление позиции при скролле или изменении размера окна
const updateDropdownPosition = () => {
  if (!showReportsDropdown.value || !reportsButtonRef.value || !dropdownMenuRef.value || !sidebarRef.value) {
    return;
  }
  
  const buttonRect = reportsButtonRef.value.getBoundingClientRect();
  const sidebarRect = sidebarRef.value.getBoundingClientRect();
  
  let leftPosition: number;
  let topPosition: number;
  
  // Проверяем, свернут ли sidebar (по ширине или по состоянию)
  const sidebarWidth = sidebarRect.width;
  const isSidebarCollapsed = isCollapsed.value || sidebarWidth <= 70; // 60px + небольшой запас
  
  if (isSidebarCollapsed) {
    // Если sidebar свернут, позиционируем меню справа от sidebar
    leftPosition = sidebarRect.right + 8;
    topPosition = buttonRect.top;
  } else {
    // Если sidebar развернут, позиционируем меню справа от кнопки
    leftPosition = buttonRect.right + 8;
    topPosition = buttonRect.top;
  }
  
  // Убеждаемся, что меню не выходит за левый край экрана
  const minLeft = 8;
  if (leftPosition < minLeft) {
    leftPosition = minLeft;
  }
  
  // Проверяем, не выходит ли меню за правый край экрана
  const menuWidth = 280; // min-width из CSS
  const maxLeft = window.innerWidth - menuWidth - 8;
  if (leftPosition > maxLeft) {
    leftPosition = Math.max(minLeft, maxLeft);
  }
  
  dropdownMenuRef.value.style.left = `${leftPosition}px`;
  dropdownMenuRef.value.style.top = `${topPosition}px`;
};

watch(isCollapsed, async () => {
  if (showReportsDropdown.value) {
    await nextTick();
    updateDropdownPosition();
  }
});

// Закрытие выпадающего меню при клике вне его
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (
    !target.closest('.nav-dropdown-wrapper') &&
    !target.closest('.nav-dropdown-menu')
  ) {
    showReportsDropdown.value = false;
  }
};

onMounted(() => {
  // Восстанавливаем состояние sidebar из localStorage
  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState === 'true') {
    isCollapsed.value = true;
  }
  
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('scroll', updateDropdownPosition, true);
  window.addEventListener('resize', updateDropdownPosition);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('scroll', updateDropdownPosition, true);
  window.removeEventListener('resize', updateDropdownPosition);
});
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #2d3748;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  z-index: 100;
  flex-shrink: 0;
  align-self: flex-start;
}

.sidebar.collapsed {
  width: 60px;
}

.sidebar-content {
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;
  justify-content: flex-start;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 12px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active,
.nav-item.active {
  background: #667eea;
  color: white;
}

.nav-dropdown-wrapper.active {
  background: #667eea;
  color: white;
}

.nav-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
  transition: margin 0.3s ease;
}

.sidebar.collapsed .nav-icon {
  margin-right: 0;
}

.nav-label {
  font-size: 15px;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-label {
  display: none;
}

.nav-dropdown-wrapper {
  position: relative;
}


.nav-dropdown-menu {
  position: fixed;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  min-width: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.nav-dropdown-menu.collapsed-menu {
  left: 20px !important;
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

.sidebar-toggle {
  position: absolute;
  top: 50%;
  right: -15px;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: #2d3748;
  border: 2px solid #4a5568;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  z-index: 10;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  line-height: 1;
}

.sidebar-toggle:hover {
  background: #4a5568;
  border-color: #667eea;
}

/* Скролл для sidebar */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
