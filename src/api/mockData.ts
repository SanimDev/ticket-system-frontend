import type {
  User,
  Category,
  Ticket,
  TicketComment,
  StatusHistory,
  AuditLog,
  DashboardSummary,
  PageResponse,
  TicketFilterParams,
  CreateTicketRequest,
  DuplicateTicketRequest,
  CategoryRequest,
} from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    fullName: 'Sarah Jenkins (Admin)',
    email: 'admin@helpdesk.com',
    role: 'ADMIN',
    active: true,
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 2,
    fullName: 'Alex Vance (Senior Support)',
    email: 'agent@helpdesk.com',
    role: 'AGENT',
    active: true,
    createdAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 3,
    fullName: 'Morgan Hayes (Support Specialist)',
    email: 'morgan.agent@helpdesk.com',
    role: 'AGENT',
    active: true,
    createdAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 4,
    fullName: 'David Miller (Customer)',
    email: 'customer@helpdesk.com',
    role: 'CUSTOMER',
    active: true,
    createdAt: '2026-02-10T14:20:00Z',
  },
  {
    id: 5,
    fullName: 'Emma Watson',
    email: 'emma@clientcorp.io',
    role: 'CUSTOMER',
    active: true,
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 6,
    fullName: 'Inactive User',
    email: 'inactive@example.com',
    role: 'CUSTOMER',
    active: false,
    createdAt: '2026-01-05T09:00:00Z',
  },
];

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Technical Support',
    description: 'Hardware, software crashes, bugs, and configuration issues',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Billing & Invoicing',
    description: 'Payments, subscription renewals, invoices, and charge disputes',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Account & Security',
    description: 'Password resets, 2FA setup, access permissions, and account recovery',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'Feature Requests',
    description: 'Product suggestions, workflow improvements, and integrations',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 5,
    name: 'Legacy Hardware (Archived)',
    description: 'Deprecated hardware lines no longer under active warranty',
    active: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 101,
    ticketNumber: 'TCK-2026-001',
    title: 'Production Database High CPU Spike & Latency',
    description: 'The primary PostgreSQL read replica is experiencing constant 98% CPU utilization causing slow API response times for EU customers.',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    requester: MOCK_USERS[3], // David Miller
    assignedTo: MOCK_USERS[1], // Alex Vance
    category: MOCK_CATEGORIES[0],
    dueDate: '2026-11-12T18:00:00Z',
    createdAt: '2026-11-09T08:30:00Z',
    updatedAt: '2026-11-10T09:15:00Z',
  },
  {
    id: 102,
    ticketNumber: 'TCK-2026-002',
    title: 'Cannot download VAT Invoice for October subscription',
    description: 'When clicking on the download PDF button in the billing portal, a 502 Bad Gateway is returned.',
    status: 'OPEN',
    priority: 'HIGH',
    requester: MOCK_USERS[4], // Emma Watson
    assignedTo: null,
    category: MOCK_CATEGORIES[1],
    dueDate: '2026-11-14T12:00:00Z',
    createdAt: '2026-11-10T04:15:00Z',
    updatedAt: '2026-11-10T04:15:00Z',
  },
  {
    id: 103,
    ticketNumber: 'TCK-2026-003',
    title: 'Request for Okta SSO SAML 2.0 Integration',
    description: 'Our enterprise organization is mandating centralized Identity Provider enforcement via Okta. Need SAML metadata endpoint.',
    status: 'PENDING',
    priority: 'MEDIUM',
    requester: MOCK_USERS[3],
    assignedTo: MOCK_USERS[2], // Morgan Hayes
    category: MOCK_CATEGORIES[2],
    dueDate: '2026-11-20T17:00:00Z',
    createdAt: '2026-11-08T11:00:00Z',
    updatedAt: '2026-11-09T14:30:00Z',
  },
  {
    id: 104,
    ticketNumber: 'TCK-2026-004',
    title: 'Add Webhook Notification Support for Ticket Events',
    description: 'Would love an outbound webhook trigger when a ticket status switches to RESOLVED or CLOSED so we can sync with Slack.',
    status: 'OPEN',
    priority: 'LOW',
    requester: MOCK_USERS[4],
    assignedTo: null,
    category: MOCK_CATEGORIES[3],
    dueDate: '2026-11-30T00:00:00Z',
    createdAt: '2026-11-07T16:45:00Z',
    updatedAt: '2026-11-07T16:45:00Z',
  },
  {
    id: 105,
    ticketNumber: 'TCK-2026-005',
    title: '2-Factor Authentication recovery code failed',
    description: 'Customer lost their authenticator device and secondary backup key is not passing verification check.',
    status: 'RESOLVED',
    priority: 'URGENT',
    requester: MOCK_USERS[3],
    assignedTo: MOCK_USERS[1],
    category: MOCK_CATEGORIES[2],
    dueDate: '2026-11-09T10:00:00Z',
    createdAt: '2026-11-06T09:00:00Z',
    updatedAt: '2026-11-08T16:00:00Z',
    resolvedAt: '2026-11-08T16:00:00Z',
  },
  {
    id: 106,
    ticketNumber: 'TCK-2026-006',
    title: 'Duplicate charge on Visa ending in 4092',
    description: 'Customer was billed twice during annual renewal cycle due to timeout error.',
    status: 'CLOSED',
    priority: 'HIGH',
    requester: MOCK_USERS[4],
    assignedTo: MOCK_USERS[2],
    category: MOCK_CATEGORIES[1],
    createdAt: '2026-11-01T13:20:00Z',
    updatedAt: '2026-11-04T11:00:00Z',
    resolvedAt: '2026-11-03T15:00:00Z',
    closedAt: '2026-11-04T11:00:00Z',
  },
  {
    id: 107,
    ticketNumber: 'TCK-2026-007',
    title: 'Mobile app crashes on ticket attachment upload',
    description: 'Android users on OS version 14 report crash when picking images from gallery exceeding 5MB.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    requester: MOCK_USERS[3],
    assignedTo: MOCK_USERS[1],
    category: MOCK_CATEGORIES[0],
    dueDate: '2026-11-15T18:00:00Z',
    createdAt: '2026-11-09T12:00:00Z',
    updatedAt: '2026-11-10T08:00:00Z',
  },
  {
    id: 108,
    ticketNumber: 'TCK-2026-008',
    title: 'Export Ticket History to CSV feature request',
    description: 'Managers need periodic audit exports of resolved support cases in standard spreadsheet format.',
    status: 'OPEN',
    priority: 'MEDIUM',
    requester: MOCK_USERS[4],
    assignedTo: null,
    category: MOCK_CATEGORIES[3],
    createdAt: '2026-11-10T02:00:00Z',
    updatedAt: '2026-11-10T02:00:00Z',
  },
];

export const MOCK_COMMENTS: Record<number, TicketComment[]> = {
  101: [
    {
      id: 1,
      ticketId: 101,
      user: MOCK_USERS[3],
      commentText: 'The latency started right around 08:15 UTC. We are seeing 504 gateway timeouts on the checkout flow.',
      internalNote: false,
      createdAt: '2026-11-09T08:45:00Z',
    },
    {
      id: 2,
      ticketId: 101,
      user: MOCK_USERS[1],
      commentText: 'Looking into RDS CloudWatch metrics. A bad analytical query without index was locking table orders.',
      internalNote: true,
      createdAt: '2026-11-09T09:10:00Z',
    },
    {
      id: 3,
      ticketId: 101,
      user: MOCK_USERS[1],
      commentText: 'We identified the blocking query and terminated the long-running transaction. We are continuing to monitor load.',
      internalNote: false,
      createdAt: '2026-11-09T09:30:00Z',
    },
  ],
  102: [
    {
      id: 4,
      ticketId: 102,
      user: MOCK_USERS[4],
      commentText: 'Attached screenshot of the error modal if that helps.',
      internalNote: false,
      createdAt: '2026-11-10T04:20:00Z',
    },
  ],
  103: [
    {
      id: 5,
      ticketId: 103,
      user: MOCK_USERS[2],
      commentText: 'Please share your IdP XML metadata or entity ID and we will generate the ACS URL for your tenant.',
      internalNote: false,
      createdAt: '2026-11-09T14:30:00Z',
    },
  ],
};

export const MOCK_STATUS_HISTORY: Record<number, StatusHistory[]> = {
  101: [
    {
      id: 1,
      ticketId: 101,
      oldStatus: null,
      newStatus: 'OPEN',
      changedBy: MOCK_USERS[3],
      changeReason: 'Ticket submitted by customer',
      changedAt: '2026-11-09T08:30:00Z',
    },
    {
      id: 2,
      ticketId: 101,
      oldStatus: 'OPEN',
      newStatus: 'IN_PROGRESS',
      changedBy: MOCK_USERS[1],
      changeReason: 'Assigned to Alex Vance and began root cause investigation',
      changedAt: '2026-11-09T09:05:00Z',
    },
  ],
  102: [
    {
      id: 3,
      ticketId: 102,
      oldStatus: null,
      newStatus: 'OPEN',
      changedBy: MOCK_USERS[4],
      changeReason: 'Ticket created',
      changedAt: '2026-11-10T04:15:00Z',
    },
  ],
  103: [
    {
      id: 4,
      ticketId: 103,
      oldStatus: 'OPEN',
      newStatus: 'PENDING',
      changedBy: MOCK_USERS[2],
      changeReason: 'Awaiting SAML metadata file from customer',
      changedAt: '2026-11-09T14:30:00Z',
    },
  ],
  105: [
    {
      id: 5,
      ticketId: 105,
      oldStatus: 'IN_PROGRESS',
      newStatus: 'RESOLVED',
      changedBy: MOCK_USERS[1],
      changeReason: 'Identity confirmed via video verification and 2FA reset completed',
      changedAt: '2026-11-08T16:00:00Z',
    },
  ],
  106: [
    {
      id: 6,
      ticketId: 106,
      oldStatus: 'RESOLVED',
      newStatus: 'CLOSED',
      changedBy: MOCK_USERS[0],
      changeReason: 'Refund verified in Stripe; ticket closed per SLA',
      changedAt: '2026-11-04T11:00:00Z',
    },
  ],
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 1,
    actor: MOCK_USERS[0],
    action: 'USER_ROLE_UPDATED',
    entityType: 'User',
    entityId: 2,
    description: 'Promoted user Alex Vance to Senior AGENT role',
    oldValues: JSON.stringify({ role: 'AGENT', level: 'Junior' }, null, 2),
    newValues: JSON.stringify({ role: 'AGENT', level: 'Senior' }, null, 2),
    ipAddress: '192.168.1.42',
    createdAt: '2026-11-10T09:40:00Z',
  },
  {
    id: 2,
    actor: MOCK_USERS[1],
    action: 'TICKET_STATUS_UPDATED',
    entityType: 'Ticket',
    entityId: 101,
    description: 'Updated ticket TCK-2026-001 status to IN_PROGRESS',
    oldValues: JSON.stringify({ status: 'OPEN' }, null, 2),
    newValues: JSON.stringify({ status: 'IN_PROGRESS', reason: 'Began debugging read replica' }, null, 2),
    ipAddress: '192.168.1.18',
    createdAt: '2026-11-09T09:05:00Z',
  },
  {
    id: 3,
    actor: MOCK_USERS[0],
    action: 'CATEGORY_CREATED',
    entityType: 'Category',
    entityId: 4,
    description: 'Created new category: Feature Requests',
    oldValues: undefined,
    newValues: JSON.stringify({ name: 'Feature Requests', active: true }, null, 2),
    ipAddress: '192.168.1.42',
    createdAt: '2026-11-05T10:15:00Z',
  },
  {
    id: 4,
    actor: MOCK_USERS[2],
    action: 'TICKET_ASSIGNED',
    entityType: 'Ticket',
    entityId: 103,
    description: 'Assigned ticket TCK-2026-003 to Morgan Hayes',
    oldValues: JSON.stringify({ assignedTo: null }, null, 2),
    newValues: JSON.stringify({ assignedTo: 'Morgan Hayes (ID: 3)' }, null, 2),
    ipAddress: '192.168.1.95',
    createdAt: '2026-11-08T11:30:00Z',
  },
  {
    id: 5,
    actor: MOCK_USERS[0],
    action: 'USER_STATUS_TOGGLED',
    entityType: 'User',
    entityId: 6,
    description: 'Deactivated inactive account',
    oldValues: JSON.stringify({ active: true }, null, 2),
    newValues: JSON.stringify({ active: false }, null, 2),
    ipAddress: '192.168.1.42',
    createdAt: '2026-11-04T14:00:00Z',
  },
];

// In-Memory state clone for Mock Session
class MockDatabase {
  private users: User[] = [...MOCK_USERS];
  private categories: Category[] = [...MOCK_CATEGORIES];
  private tickets: Ticket[] = [...MOCK_TICKETS];
  private comments: Record<number, TicketComment[]> = { ...MOCK_COMMENTS };
  private history: Record<number, StatusHistory[]> = { ...MOCK_STATUS_HISTORY };
  private auditLogs: AuditLog[] = [...MOCK_AUDIT_LOGS];

  getUsers(page = 0, size = 10): PageResponse<User> {
    const start = page * size;
    const paginated = this.users.slice(start, start + size);
    return {
      content: paginated,
      totalElements: this.users.length,
      totalPages: Math.ceil(this.users.length / size),
      size,
      number: page,
    };
  }

  toggleUserStatus(id: number, active: boolean): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error('User not found');
    user.active = active;
    this.addAuditLog('USER_STATUS_TOGGLED', 'User', id, `Set active status to ${active}`);
    return user;
  }

  getAssignees(): User[] {
    return this.users.filter((u) => (u.role === 'ADMIN' || u.role === 'AGENT') && u.active);
  }

  getCategories(activeOnly = false): Category[] {
    if (activeOnly) {
      return this.categories.filter((c) => c.active);
    }
    return [...this.categories];
  }

  createCategory(req: CategoryRequest): Category {
    const newCat: Category = {
      id: Date.now(),
      name: req.name,
      description: req.description,
      active: req.active,
      createdAt: new Date().toISOString(),
    };
    this.categories.push(newCat);
    this.addAuditLog('CATEGORY_CREATED', 'Category', newCat.id, `Created category ${newCat.name}`);
    return newCat;
  }

  updateCategory(id: number, req: CategoryRequest): Category {
    const cat = this.categories.find((c) => c.id === id);
    if (!cat) throw new Error('Category not found');
    cat.name = req.name;
    cat.description = req.description;
    cat.active = req.active;
    this.addAuditLog('CATEGORY_UPDATED', 'Category', id, `Updated category ${cat.name}`);
    return cat;
  }

  getTickets(params: TicketFilterParams): PageResponse<Ticket> {
    const page = params.page ?? 0;
    const size = params.size ?? 10;
    let filtered = [...this.tickets];

    if (params.status) {
      filtered = filtered.filter((t) => t.status === params.status);
    }
    if (params.priority) {
      filtered = filtered.filter((t) => t.priority === params.priority);
    }
    if (params.categoryId) {
      filtered = filtered.filter((t) => t.category.id === Number(params.categoryId));
    }
    if (params.assignedTo) {
      filtered = filtered.filter((t) => t.assignedTo?.id === Number(params.assignedTo));
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = params.sortBy || 'createdAt';
    const direction = params.direction || 'desc';
    filtered.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy] ?? '';
      const bVal = (b as unknown as Record<string, unknown>)[sortBy] ?? '';
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    const start = page * size;
    const content = filtered.slice(start, start + size);
    return {
      content,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      size,
      number: page,
    };
  }

  getTicketById(id: number): Ticket | undefined {
    return this.tickets.find((t) => t.id === Number(id));
  }

  createTicket(req: CreateTicketRequest, user: User): Ticket {
    const cat = this.categories.find((c) => c.id === req.categoryId) || this.categories[0];
    const newId = this.tickets.length > 0 ? Math.max(...this.tickets.map((t) => t.id)) + 1 : 101;
    const newTicket: Ticket = {
      id: newId,
      ticketNumber: `TCK-2026-${String(newId).padStart(3, '0')}`,
      title: req.title,
      description: req.description,
      status: 'OPEN',
      priority: req.priority,
      requester: user,
      assignedTo: null,
      category: cat,
      dueDate: req.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tickets.unshift(newTicket);
    this.comments[newId] = [];
    this.history[newId] = [
      {
        id: Date.now(),
        ticketId: newId,
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: user,
        changeReason: 'Ticket submitted',
        changedAt: new Date().toISOString(),
      },
    ];
    this.addAuditLog('TICKET_CREATED', 'Ticket', newId, `Ticket created: ${newTicket.title}`);
    return newTicket;
  }

  updateTicket(id: number, req: Partial<CreateTicketRequest>): Ticket {
    const t = this.getTicketById(id);
    if (!t) throw new Error('Ticket not found');
    if (req.title) t.title = req.title;
    if (req.description) t.description = req.description;
    if (req.categoryId) {
      const cat = this.categories.find((c) => c.id === req.categoryId);
      if (cat) t.category = cat;
    }
    t.updatedAt = new Date().toISOString();
    return t;
  }

  changeStatus(id: number, newStatus: Ticket['status'], reason: string | undefined, user: User): Ticket {
    const t = this.getTicketById(id);
    if (!t) throw new Error('Ticket not found');
    const oldStatus = t.status;
    t.status = newStatus;
    t.updatedAt = new Date().toISOString();
    if (newStatus === 'RESOLVED') t.resolvedAt = new Date().toISOString();
    if (newStatus === 'CLOSED') t.closedAt = new Date().toISOString();

    if (!this.history[id]) this.history[id] = [];
    this.history[id].push({
      id: Date.now(),
      ticketId: id,
      oldStatus,
      newStatus,
      changedBy: user,
      changeReason: reason || `Status changed from ${oldStatus} to ${newStatus}`,
      changedAt: new Date().toISOString(),
    });
    this.addAuditLog('TICKET_STATUS_CHANGED', 'Ticket', id, `Status changed to ${newStatus}`);
    return t;
  }

  assignTicket(id: number, assigneeId: number | null | undefined): Ticket {
    const t = this.getTicketById(id);
    if (!t) throw new Error('Ticket not found');
    if (assigneeId) {
      const assignee = this.users.find((u) => u.id === Number(assigneeId));
      t.assignedTo = assignee || null;
    } else {
      t.assignedTo = null;
    }
    t.updatedAt = new Date().toISOString();
    this.addAuditLog('TICKET_ASSIGNMENT_CHANGED', 'Ticket', id, `Assigned to: ${t.assignedTo?.fullName || 'Unassigned'}`);
    return t;
  }

  changePriority(id: number, priority: Ticket['priority']): Ticket {
    const t = this.getTicketById(id);
    if (!t) throw new Error('Ticket not found');
    t.priority = priority;
    t.updatedAt = new Date().toISOString();
    return t;
  }

  getComments(ticketId: number, isAgentOrAdmin: boolean): TicketComment[] {
    const list = this.comments[ticketId] || [];
    if (!isAgentOrAdmin) {
      return list.filter((c) => !c.internalNote);
    }
    return list;
  }

  addComment(ticketId: number, text: string, internalNote: boolean, user: User): TicketComment {
    if (!this.comments[ticketId]) this.comments[ticketId] = [];
    const newComment: TicketComment = {
      id: Date.now(),
      ticketId,
      user,
      commentText: text,
      internalNote,
      createdAt: new Date().toISOString(),
    };
    this.comments[ticketId].push(newComment);
    return newComment;
  }

  getHistory(ticketId: number): StatusHistory[] {
    return this.history[ticketId] || [];
  }

  duplicateTicket(originalId: number, req: DuplicateTicketRequest, user: User): Ticket {
    const original = this.getTicketById(originalId);
    const cat = this.categories.find((c) => c.id === req.categoryId) || original?.category || this.categories[0];
    const newId = Math.max(...this.tickets.map((t) => t.id)) + 1;
    const duplicated: Ticket = {
      id: newId,
      ticketNumber: `TCK-2026-${String(newId).padStart(3, '0')}`,
      title: req.title,
      description: req.description,
      status: 'OPEN',
      priority: req.priority,
      requester: user,
      assignedTo: null,
      category: cat,
      sourceTicketId: originalId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.tickets.unshift(duplicated);
    this.comments[newId] = [];
    this.history[newId] = [
      {
        id: Date.now(),
        ticketId: newId,
        oldStatus: null,
        newStatus: 'OPEN',
        changedBy: user,
        changeReason: `Duplicated from Ticket #${original?.ticketNumber || originalId}`,
        changedAt: new Date().toISOString(),
      },
    ];
    this.addAuditLog('TICKET_DUPLICATED', 'Ticket', newId, `Cloned from #${original?.ticketNumber}`);
    return duplicated;
  }

  getDashboardSummary(): DashboardSummary {
    const statusCounts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      PENDING: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };
    const priorityCounts = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      URGENT: 0,
    };

    for (const t of this.tickets) {
      if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
    }

    return {
      totalTickets: this.tickets.length,
      openTickets: statusCounts.OPEN,
      inProgressTickets: statusCounts.IN_PROGRESS,
      pendingTickets: statusCounts.PENDING,
      resolvedTickets: statusCounts.RESOLVED,
      closedTickets: statusCounts.CLOSED,
      statusCounts,
      priorityCounts,
    };
  }

  getRecentTickets(limit = 5): PageResponse<Ticket> {
    const content = this.tickets.slice(0, limit);
    return {
      content,
      totalElements: this.tickets.length,
      totalPages: Math.ceil(this.tickets.length / limit),
      size: limit,
      number: 0,
    };
  }

  getAuditLogs(page = 0, size = 20): PageResponse<AuditLog> {
    const start = page * size;
    const paginated = this.auditLogs.slice(start, start + size);
    return {
      content: paginated,
      totalElements: this.auditLogs.length,
      totalPages: Math.ceil(this.auditLogs.length / size),
      size,
      number: page,
    };
  }

  private addAuditLog(action: string, entityType: string, entityId: number, description: string) {
    this.auditLogs.unshift({
      id: Date.now(),
      actor: MOCK_USERS[0],
      action,
      entityType,
      entityId,
      description,
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString(),
    });
  }
}

export const mockDb = new MockDatabase();

