import apiClient from './client';
import type { DashboardSummary, PageResponse, Ticket } from '../types';
import { useAuthStore } from '../store/authStore';
import { mockDb } from './mockData';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getDashboardSummary();
    }
    try {
      const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getDashboardSummary();
      }
      throw err;
    }
  },

  getRecentTickets: async (limit = 5): Promise<PageResponse<Ticket>> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getRecentTickets(limit);
    }
    try {
      const response = await apiClient.get<PageResponse<Ticket>>(`/dashboard/recent-tickets`, {
        params: { limit },
      });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getRecentTickets(limit);
      }
      throw err;
    }
  },
};

