import apiClient from './client';
import type { Category, CategoryRequest } from '../types';
import { useAuthStore } from '../store/authStore';
import { mockDb } from './mockData';

export const categoriesApi = {
  getCategories: async (activeOnly = false): Promise<Category[]> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getCategories(activeOnly);
    }
    try {
      const response = await apiClient.get<Category[]>('/categories', {
        params: { activeOnly },
      });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getCategories(activeOnly);
      }
      throw err;
    }
  },

  createCategory: async (data: CategoryRequest): Promise<Category> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.createCategory(data);
    }
    try {
      const response = await apiClient.post<Category>('/categories', data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.createCategory(data);
      }
      throw err;
    }
  },

  updateCategory: async (id: number, data: CategoryRequest): Promise<Category> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.updateCategory(id, data);
    }
    try {
      const response = await apiClient.patch<Category>(`/categories/${id}`, data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.updateCategory(id, data);
      }
      throw err;
    }
  },
};

