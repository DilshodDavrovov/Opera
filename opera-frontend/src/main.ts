import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { useOrganizationsStore } from './stores/organizations'
import { useTabsStore } from './stores/tabs'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Инициализируем tabs store
const tabsStore = useTabsStore()

// Инициализация stores после создания pinia
const authStore = useAuthStore()
authStore.init()

// Загружаем организации если пользователь авторизован
if (authStore.isAuthenticated) {
  const organizationsStore = useOrganizationsStore()
  organizationsStore.loadOrganizations().catch((error) => {
    console.error('Failed to load organizations on init:', error)
  })
}

app.mount('#app')
