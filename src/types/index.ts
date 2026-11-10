export type Role = 'CUSTOMER' | 'AGENT' | 'ADMIN';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  requester: User;
  assignedTo?: User | null;
  category: Category;
  sourceTicketId?: number | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;
}

export interface TicketComment {
  id: number;
  ticketId: number;
  user: User;
  commentText: string;
  internalNote: boolean;
  createdAt: string;
}

export interface StatusHistory {
  id: number;
  ticketId: number;
  oldStatus?: TicketStatus | null;
  newStatus: TicketStatus;
  changedBy: User;
  changeReason?: string | null;
  changedAt: string;
}

export interface DashboardSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  statusCounts: Record<TicketStatus, number>;
  priorityCounts: Record<TicketPriority, number>;
}

export interface AuditLog {
  id: number;
  actor: User;
  action: string;
  entityType: string;
  entityId: number;
  description: string;
  oldValues?: string;
  newValues?: string;
  ipAddress: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-indexed current page
}

// Request and Filter Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  categoryId: number;
  priority: TicketPriority;
  dueDate?: string | null;
}

export interface UpdateTicketRequest {
  title: string;
  description: string;
  categoryId: number;
}

export interface ChangeStatusRequest {
  status: TicketStatus;
  reason?: string;
}

export interface AssignTicketRequest {
  assigneeId?: number | null;
}

export interface ChangePriorityRequest {
  priority: TicketPriority;
}

export interface CreateCommentRequest {
  commentText: string;
  internalNote: boolean;
}

export interface DuplicateTicketRequest {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId: number;
}

export interface CategoryRequest {
  name: string;
  description: string;
  active: boolean;
}

export interface TicketFilterParams {
  status?: TicketStatus;
  priority?: TicketPriority;
  categoryId?: number;
  assignedTo?: number;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

