import apiClient from './client';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types';
import { useAuthStore } from '../store/authStore';
import { MOCK_USERS } from './mockData';

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      // Find matching mock user or default based on email
      const user =
        MOCK_USERS.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase()) ||
        MOCK_USERS[0];
      return {
        token: `mock-jwt-token-${user.role.toLowerCase()}-${Date.now()}`,
        user,
      };
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (err: unknown) {
      // If network unreachable, check if user wanted demo mode
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        const user =
          MOCK_USERS.find((u) => u.email.toLowerCase() === credentials.email.toLowerCase()) ||
          MOCK_USERS[0];
        useAuthStore.getState().setDemoMode(true);
        return {
          token: `mock-jwt-token-${user.role.toLowerCase()}-${Date.now()}`,
          user,
        };
      }
      throw err;
    }
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      const newUser: User = {
        id: Date.now(),
        fullName: data.fullName,
        email: data.email,
        role: 'CUSTOMER',
        active: true,
        createdAt: new Date().toISOString(),
      };
      return {
        token: `mock-jwt-token-customer-${Date.now()}`,
        user: newUser,
      };
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        const newUser: User = {
          id: Date.now(),
          fullName: data.fullName,
          email: data.email,
          role: 'CUSTOMER',
          active: true,
          createdAt: new Date().toISOString(),
        };
        useAuthStore.getState().setDemoMode(true);
        return {
          token: `mock-jwt-token-customer-${Date.now()}`,
          user: newUser,
        };
      }
      throw err;
    }
  },

  getMe: async (): Promise<User> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return useAuthStore.getState().user || MOCK_USERS[0];
    }
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};

