import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type RegisterDto, type LoginDto } from '../api/auth.api';
import router from '../router';

let refreshTimer: NodeJS.Timeout | null = null;

export const useAuthStore = defineStore('auth', () => {
  const user = ref<{
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  const init = () => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      accessToken.value = token;
      user.value = JSON.parse(userData);
      // Запускаем автоматическое обновление токена
      scheduleTokenRefresh(token);
    }
  };

  const register = async (data: RegisterDto) => {
    try {
      const response = await authApi.register(data);
      setAuth(response);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const login = async (data: LoginDto) => {
    try {
      const response = await authApi.login(data);
      setAuth(response);
      return response;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = () => {
    if (refreshTimer) {
      clearTimeout(refreshTimer);
      refreshTimer = null;
    }
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const setAuth = (response: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName?: string;
      lastName?: string;
    };
  }) => {
    accessToken.value = response.accessToken;
    refreshToken.value = response.refreshToken;
    user.value = response.user;
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    
    // Запускаем автоматическое обновление токена перед истечением
    scheduleTokenRefresh(response.accessToken);
  };

  const scheduleTokenRefresh = async (token: string) => {
    // Очищаем предыдущий таймер если есть
    if (refreshTimer) {
      clearTimeout(refreshTimer);
    }

    try {
      // Декодируем токен чтобы узнать время истечения
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresIn = payload.exp * 1000 - Date.now();
      
      // Обновляем токен за 5 минут до истечения
      const refreshTime = expiresIn - 5 * 60 * 1000;
      
      if (refreshTime > 0) {
        refreshTimer = setTimeout(async () => {
          try {
            const currentRefreshToken = localStorage.getItem('refreshToken');
            if (currentRefreshToken) {
              const response = await authApi.refresh(currentRefreshToken);
              setAuth({
                ...response,
                user: user.value!,
              });
            }
          } catch (error) {
            console.error('Failed to refresh token:', error);
            logout();
          }
        }, refreshTime);
      }
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  };

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    init,
    register,
    login,
    logout,
  };
});
