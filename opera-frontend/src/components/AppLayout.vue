<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-content">
        <h1 class="logo">Opera ERP</h1>
        <nav class="nav">
          <router-link to="/" class="nav-link">Главная</router-link>
          <router-link
            v-if="currentOrganizationId"
            :to="`/organizations/${currentOrganizationId}/accounts`"
            class="nav-link"
          >
            Счета
          </router-link>
          <router-link
            v-if="currentOrganizationId"
            :to="`/organizations/${currentOrganizationId}/transactions`"
            class="nav-link"
          >
            Проводки
          </router-link>
          <router-link
            v-if="currentOrganizationId"
            :to="`/organizations/${currentOrganizationId}/reports`"
            class="nav-link"
          >
            Отчеты
          </router-link>
        </nav>
        <div class="header-actions">
          <select
            v-if="organizations.length > 0"
            :value="currentOrganizationId || ''"
            @change="handleOrganizationChange"
            class="org-select"
          >
            <option value="" disabled>Выберите организацию</option>
            <option
              v-for="org in organizations"
              :key="org.id"
              :value="org.id"
            >
              {{ org.name }}
            </option>
          </select>
          <button @click="handleLogout" class="btn-logout">Выйти</button>
        </div>
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useOrganizationsStore } from '../stores/organizations';

const router = useRouter();
const authStore = useAuthStore();
const organizationsStore = useOrganizationsStore();

const organizations = computed(() => organizationsStore.organizations);
const currentOrganizationId = computed(
  () => organizationsStore.currentOrganizationId
);

const handleOrganizationChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  organizationsStore.setCurrentOrganization(target.value);
  router.push('/');
};

const handleLogout = () => {
  authStore.logout();
};
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: #667eea;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 20px;
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

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.org-select {
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.org-select option {
  background: #667eea;
  color: white;
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
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}
</style>
