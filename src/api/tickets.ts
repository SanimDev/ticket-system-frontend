import apiClient from './client';
import type {
  Ticket,
  TicketFilterParams,
  PageResponse,
  CreateTicketRequest,
  UpdateTicketRequest,
  ChangeStatusRequest,
  AssignTicketRequest,
  ChangePriorityRequest,
  TicketComment,
  CreateCommentRequest,
  StatusHistory,
  DuplicateTicketRequest,
} from '../types';
import { useAuthStore } from '../store/authStore';
import { mockDb, MOCK_USERS } from './mockData';

export const ticketsApi = {
  getTickets: async (params: TicketFilterParams = {}): Promise<PageResponse<Ticket>> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getTickets(params);
    }
    try {
      const response = await apiClient.get<PageResponse<Ticket>>('/tickets', { params });
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getTickets(params);
      }
      throw err;
    }
  },

  createTicket: async (data: CreateTicketRequest): Promise<Ticket> => {
    const isDemo = useAuthStore.getState().demoMode;
    const currentUser = useAuthStore.getState().user || MOCK_USERS[3];
    if (isDemo) {
      return mockDb.createTicket(data, currentUser);
    }
    try {
      const response = await apiClient.post<Ticket>('/tickets', data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.createTicket(data, currentUser);
      }
      throw err;
    }
  },

  getTicketById: async (id: number): Promise<Ticket> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      const ticket = mockDb.getTicketById(id);
      if (!ticket) throw new Error('Ticket not found');
      return ticket;
    }
    try {
      const response = await apiClient.get<Ticket>(`/tickets/${id}`);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        const ticket = mockDb.getTicketById(id);
        if (!ticket) throw new Error('Ticket not found');
        return ticket;
      }
      throw err;
    }
  },

  updateTicket: async (id: number, data: UpdateTicketRequest): Promise<Ticket> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.updateTicket(id, data);
    }
    try {
      const response = await apiClient.patch<Ticket>(`/tickets/${id}`, data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.updateTicket(id, data);
      }
      throw err;
    }
  },

  changeStatus: async (id: number, data: ChangeStatusRequest): Promise<Ticket> => {
    const isDemo = useAuthStore.getState().demoMode;
    const currentUser = useAuthStore.getState().user || MOCK_USERS[0];
    if (isDemo) {
      return mockDb.changeStatus(id, data.status, data.reason, currentUser);
    }
    try {
      const response = await apiClient.patch<Ticket>(`/tickets/${id}/status`, data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.changeStatus(id, data.status, data.reason, currentUser);
      }
      throw err;
    }
  },

  assignTicket: async (id: number, data: AssignTicketRequest): Promise<Ticket> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.assignTicket(id, data.assigneeId);
    }
    try {
      const response = await apiClient.patch<Ticket>(`/tickets/${id}/assignment`, data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.assignTicket(id, data.assigneeId);
      }
      throw err;
    }
  },

  changePriority: async (id: number, data: ChangePriorityRequest): Promise<Ticket> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.changePriority(id, data.priority);
    }
    try {
      const response = await apiClient.patch<Ticket>(`/tickets/${id}/priority`, data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.changePriority(id, data.priority);
      }
      throw err;
    }
  },

  getComments: async (id: number): Promise<TicketComment[]> => {
    const isDemo = useAuthStore.getState().demoMode;
    const currentUser = useAuthStore.getState().user;
    const isStaff = currentUser?.role === 'AGENT' || currentUser?.role === 'ADMIN';
    if (isDemo) {
      return mockDb.getComments(id, isStaff);
    }
    try {
      const response = await apiClient.get<TicketComment[]>(`/tickets/${id}/comments`);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getComments(id, isStaff);
      }
      throw err;
    }
  },

  addComment: async (id: number, data: CreateCommentRequest): Promise<TicketComment> => {
    const isDemo = useAuthStore.getState().demoMode;
    const currentUser = useAuthStore.getState().user || MOCK_USERS[0];
    if (isDemo) {
      return mockDb.addComment(id, data.commentText, data.internalNote, currentUser);
    }
    try {
      const response = await apiClient.post<TicketComment>(`/tickets/${id}/comments`, data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.addComment(id, data.commentText, data.internalNote, currentUser);
      }
      throw err;
    }
  },

  getHistory: async (id: number): Promise<StatusHistory[]> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      return mockDb.getHistory(id);
    }
    try {
      const response = await apiClient.get<StatusHistory[]>(`/tickets/${id}/history`);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.getHistory(id);
      }
      throw err;
    }
  },

  getDuplicatePreview: async (id: number): Promise<DuplicateTicketRequest> => {
    const isDemo = useAuthStore.getState().demoMode;
    if (isDemo) {
      const ticket = mockDb.getTicketById(id);
      return {
        title: `[Copy] ${ticket?.title || ''}`,
        description: ticket?.description || '',
        priority: ticket?.priority || 'MEDIUM',
        categoryId: ticket?.category.id || 1,
      };
    }
    try {
      const response = await apiClient.get<DuplicateTicketRequest>(`/tickets/${id}/duplicate`);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        const ticket = mockDb.getTicketById(id);
        return {
          title: `[Copy] ${ticket?.title || ''}`,
          description: ticket?.description || '',
          priority: ticket?.priority || 'MEDIUM',
          categoryId: ticket?.category.id || 1,
        };
      }
      throw err;
    }
  },

  duplicateTicket: async (id: number, data: DuplicateTicketRequest): Promise<Ticket> => {
    const isDemo = useAuthStore.getState().demoMode;
    const currentUser = useAuthStore.getState().user || MOCK_USERS[0];
    if (isDemo) {
      return mockDb.duplicateTicket(id, data, currentUser);
    }
    try {
      const response = await apiClient.post<Ticket>(`/tickets/${id}/duplicate`, data);
      return response.data;
    } catch (err: unknown) {
      const axiosErr = err as { code?: string; message?: string };
      if (axiosErr?.code === 'ERR_NETWORK' || axiosErr?.message?.includes('Network Error')) {
        return mockDb.duplicateTicket(id, data, currentUser);
      }
      throw err;
    }
  },
};

