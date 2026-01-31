import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi, type RegisterDto, type LoginDto } from '../api/auth.api';
import router from '../router';

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
