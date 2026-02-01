<template>
  <div v-if="tabs.length > 0" class="tabs-bar">
    <div class="tabs-container">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab', { active: activeTabId === tab.id }]"
        @click="handleTabClick(tab)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <button
          v-if="tab.closable"
          @click.stop="handleCloseTab(tab.id)"
          class="tab-close"
          title="Закрыть"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTabsStore } from '../stores/tabs';

const router = useRouter();
const tabsStore = useTabsStore();

const tabs = computed(() => tabsStore.tabs);
const activeTabId = computed(() => tabsStore.activeTabId);

const handleTabClick = (tab: { id: string; path: string }) => {
  tabsStore.setActiveTab(tab.id);
  router.push(tab.path);
};

const handleCloseTab = (tabId: string) => {
  const tab = tabsStore.tabs.find((t) => t.id === tabId);
  if (!tab) return;

  // Не закрываем главную вкладку
  if (!tab.closable) return;

  const removedTab = tabsStore.removeTab(tabId);

  // Если вкладка была закрыта, переходим на активную вкладку или на главную
  if (removedTab && tabsStore.activeTabId) {
    const activeTab = tabsStore.tabs.find((t) => t.id === tabsStore.activeTabId);
    if (activeTab) {
      router.push(activeTab.path);
    } else {
      router.push('/');
    }
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
.tabs-bar {
  background: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
  padding: 0;
  overflow-x: auto;
  overflow-y: hidden;
  position: sticky;
  top: 64px;
  z-index: 99;
  flex-shrink: 0;
  width: 100%;
}

.tabs-container {
  display: flex;
  align-items: flex-end;
  min-width: 100%;
  height: 40px;
}

.tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #e8e8e8;
  border: 1px solid #d0d0d0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  min-width: 120px;
  max-width: 250px;
  position: relative;
  margin-right: 2px;
}

.tab:hover {
  background: #f0f0f0;
}

.tab.active {
  background: white;
  border-color: #d0d0d0;
  border-bottom-color: white;
  z-index: 1;
  margin-bottom: -1px;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.tab.active .tab-title {
  color: #667eea;
  font-weight: 600;
}

.tab-close {
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: #666;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}

.tab-close:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #333;
}

.tab.active .tab-close:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

/* Скролл для вкладок */
.tabs-bar::-webkit-scrollbar {
  height: 6px;
}

.tabs-bar::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.tabs-bar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.tabs-bar::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}
</style>
