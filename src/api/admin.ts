import apiClient from './client';
import type { User, AuditLog, PageResponse } from '../types';
import { useAuthStore } from '../store/authStore';
import { mockDb } from './mockData';

export const adminApi = {
  getUsers: async (page = 0, size = 10): Promise<PageResponse<User>> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getUsers(page, size);
    }
    try {
      const response = await apiClient.get<PageResponse<User>>('/admin/users', {
        params: { page, size },
      });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getUsers(page, size);
      }
      throw err;
    }
  },

  toggleUserStatus: async (id: number, active: boolean): Promise<User> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.toggleUserStatus(id, active);
    }
    try {
      const response = await apiClient.patch<User>(`/admin/users/${id}/status`, null, {
        params: { active },
      });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.toggleUserStatus(id, active);
      }
      throw err;
    }
  },

  getAssignees: async (): Promise<User[]> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getAssignees();
    }
    try {
      const response = await apiClient.get<User[]>('/admin/assignees');
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getAssignees();
      }
      throw err;
    }
  },

  getAuditLogs: async (page = 0, size = 20): Promise<PageResponse<AuditLog>> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getAuditLogs(page, size);
    }
    try {
      const response = await apiClient.get<PageResponse<AuditLog>>('/admin/audit-logs', {
        params: { page, size },
      });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getAuditLogs(page, size);
      }
      throw err;
    }
  },
};

