import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Tab {
  id: string;
  title: string;
  path: string;
  routeName: string;
  closable: boolean;
}

export const useTabsStore = defineStore('tabs', () => {
  const tabs = ref<Tab[]>([]);
  const activeTabId = ref<string | null>(null);

  const addTab = (tab: Tab) => {
    // Проверяем, не существует ли уже такая вкладка
    const existingTab = tabs.value.find((t) => t.path === tab.path);
    if (existingTab) {
      // Если вкладка уже существует, просто активируем её
      activeTabId.value = existingTab.id;
      return existingTab;
    }

    // Добавляем новую вкладку
    tabs.value.push(tab);
    activeTabId.value = tab.id;
    return tab;
  };

  const removeTab = (tabId: string) => {
    const index = tabs.value.findIndex((t) => t.id === tabId);
    if (index === -1) return;

    const removedTab = tabs.value[index];
    tabs.value.splice(index, 1);

    // Если закрыли активную вкладку, активируем соседнюю или последнюю
    if (activeTabId.value === tabId) {
      if (tabs.value.length > 0) {
        // Пытаемся активировать следующую вкладку, если есть
        const nextTab = tabs.value[index] || tabs.value[index - 1];
        activeTabId.value = nextTab?.id || null;
      } else {
        activeTabId.value = null;
      }
    }

    return removedTab;
  };

  const setActiveTab = (tabId: string) => {
    if (tabs.value.find((t) => t.id === tabId)) {
      activeTabId.value = tabId;
    }
  };

  const getTabByPath = (path: string): Tab | undefined => {
    return tabs.value.find((t) => t.path === path);
  };

  const clearTabs = () => {
    tabs.value = [];
    activeTabId.value = null;
  };

  return {
    tabs,
    activeTabId,
    addTab,
    removeTab,
    setActiveTab,
    getTabByPath,
    clearTabs,
  };
});
