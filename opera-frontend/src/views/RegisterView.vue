<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Opera ERP</h1>
      <h2>Регистрация</h2>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="user@example.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="8"
            placeholder="Минимум 8 символов"
          />
        </div>

        <div class="form-group">
          <label for="firstName">Имя (необязательно)</label>
          <input
            id="firstName"
            v-model="form.firstName"
            type="text"
            placeholder="Иван"
          />
        </div>

        <div class="form-group">
          <label for="lastName">Фамилия (необязательно)</label>
          <input
            id="lastName"
            v-model="form.lastName"
            type="text"
            placeholder="Иванов"
          />
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <button type="submit" :disabled="loading" class="btn-primary">
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>

      <div class="register-footer">
        <p>
          Уже есть аккаунт?
          <router-link to="/login">Войти</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useOrganizationsStore } from '../stores/organizations';
import { formatApiError } from '../utils/errorHandler';

const router = useRouter();
const authStore = useAuthStore();
const organizationsStore = useOrganizationsStore();

const form = ref({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
});

const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  loading.value = true;
  error.value = '';

  try {
    await authStore.register({
      email: form.value.email,
      password: form.value.password,
      firstName: form.value.firstName || undefined,
      lastName: form.value.lastName || undefined,
    });
    
    // Ждем обновления реактивного состояния и localStorage
    await nextTick();
    
    // Небольшая задержка для гарантии, что токен установлен
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Загружаем организации
    try {
      await organizationsStore.loadOrganizations();
    } catch (orgError) {
      // Игнорируем ошибки загрузки организаций, они не критичны для регистрации
      console.warn('Failed to load organizations:', orgError);
    }
    
    // Используем replace вместо push, чтобы избежать возврата на страницу регистрации при нажатии "назад"
    await router.replace('/');
  } catch (err: any) {
    error.value = formatApiError(err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #667eea;
  margin: 0 0 10px 0;
  font-size: 32px;
}

h2 {
  text-align: center;
  color: #333;
  margin: 0 0 30px 0;
  font-size: 24px;
  font-weight: 500;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 500;
  color: #555;
  font-size: 14px;
}

input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}

.btn-primary {
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
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

.register-footer {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-footer a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-footer a:hover {
  text-decoration: underline;
}
</style>
