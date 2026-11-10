import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Space,
  Typography,
  Modal,
  Form,
  message,
  Tooltip,
} from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import type { FilterValue, SorterResult } from 'antd/es/table/interface';
import {
  PlusOutlined,
  SearchOutlined,
  ClearOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  ReloadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { ticketsApi } from '../../api/tickets';
import { categoriesApi } from '../../api/categories';
import { adminApi } from '../../api/admin';
import { StatusTag } from '../../components/StatusTag';
import { PriorityTag } from '../../components/PriorityTag';
import { CreateTicketModal } from './CreateTicketModal';
import { useAuthStore } from '../../store/authStore';
import type {
  Ticket,
  Category,
  User,
  TicketStatus,
  TicketPriority,
  TicketFilterParams,
  UpdateTicketRequest,
  DuplicateTicketRequest,
} from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const TicketListPage: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Filters state
  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination & Sorting state
  const [currentPage, setCurrentPage] = useState(0); // 0-indexed for backend
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Metadata dropdown options
  const [categories, setCategories] = useState<Category[]>([]);
  const [assignees, setAssignees] = useState<User[]>([]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicatingTicketId, setDuplicatingTicketId] = useState<number | null>(null);

  const [editForm] = Form.useForm<UpdateTicketRequest>();
  const [duplicateForm] = Form.useForm<DuplicateTicketRequest>();
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearch(searchQuery);
        setCurrentPage(0);
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Categories & Assignees once
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cats, users] = await Promise.all([
          categoriesApi.getCategories(false),
          (user?.role === 'ADMIN' || user?.role === 'AGENT') ? adminApi.getAssignees() : Promise.resolve([]),
        ]);
        setCategories(cats);
        setAssignees(users);
      } catch {
        // Silently continue if metadata fetch fails
      }
    };
    loadMetadata();
  }, [user]);

  // Fetch Tickets from API
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params: TicketFilterParams = {
        page: currentPage,
        size: pageSize,
        sortBy,
        direction: sortDirection,
        search: debouncedSearch ? debouncedSearch.trim() : undefined,
        status: statusFilter,
        priority: priorityFilter,
        categoryId: categoryFilter,
        assignedTo: assigneeFilter,
      };

      const response = await ticketsApi.getTickets(params);
      setTickets(response.content);
      setTotalElements(response.totalElements);
    } catch {
      message.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    sortBy,
    sortDirection,
    debouncedSearch,
    statusFilter,
    priorityFilter,
    categoryFilter,
    assigneeFilter,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter(undefined);
    setPriorityFilter(undefined);
    setCategoryFilter(undefined);
    setAssigneeFilter(undefined);
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(0);
  };

  // Handle AntD Table Pagination & Sorting
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Ticket> | SorterResult<Ticket>[]
  ) => {
    if (pagination.current && pagination.pageSize) {
      setCurrentPage(pagination.current - 1);
      setPageSize(pagination.pageSize);
    }

    if (!Array.isArray(sorter) && sorter.field) {
      const field = Array.isArray(sorter.field) ? sorter.field.join('.') : String(sorter.field);
      setSortBy(field);
      setSortDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    editForm.setFieldsValue({
      title: ticket.title,
      description: ticket.description,
      categoryId: ticket.category.id,
    });
    setEditModalOpen(true);
  };

  // Submit Edit
  const handleSaveEdit = async (values: UpdateTicketRequest) => {
    if (!editingTicket) return;
    try {
      setModalSubmitting(true);
      await ticketsApi.updateTicket(editingTicket.id, values);
      message.success('Ticket updated successfully');
      setEditModalOpen(false);
      setEditingTicket(null);
      fetchTickets();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to update ticket');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Open Duplicate Modal
  const handleOpenDuplicate = async (ticket: Ticket) => {
    setDuplicatingTicketId(ticket.id);
    try {
      setModalSubmitting(true);
      setDuplicateModalOpen(true);
      const preview = await ticketsApi.getDuplicatePreview(ticket.id);
      duplicateForm.setFieldsValue(preview);
    } catch {
      message.error('Failed to load duplicate preview');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Submit Duplicate
  const handleSaveDuplicate = async (values: DuplicateTicketRequest) => {
    if (!duplicatingTicketId) return;
    try {
      setModalSubmitting(true);
      const newTicket = await ticketsApi.duplicateTicket(duplicatingTicketId, values);
      message.success(`Ticket #${newTicket.ticketNumber} created from clone`);
      setDuplicateModalOpen(false);
      setDuplicatingTicketId(null);
      fetchTickets();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to duplicate ticket');
    } finally {
      setModalSubmitting(false);
    }
  };

  // Table Columns
  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 140,
      render: (num: string, record: Ticket) => (
        <span
          style={{ fontWeight: 600, color: '#1677ff', cursor: 'pointer' }}
          onClick={() => navigate(`/tickets/${record.id}`)}
        >
          {num}
        </span>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: true,
      render: (title: string, record: Ticket) => (
        <div>
          <Text
            strong
            style={{ cursor: 'pointer', display: 'block' }}
            onClick={() => navigate(`/tickets/${record.id}`)}
          >
            {title}
          </Text>
          <Space size="small" style={{ fontSize: 12, color: '#8c8c8c' }}>
            <span>Category: {record.category.name}</span>
            {record.sourceTicketId && (
              <span style={{ color: '#722ed1' }}>
                (Cloned from #{record.sourceTicketId})
              </span>
            )}
          </Space>
        </div>
      ),
    },
    {
      title: 'Requester',
      dataIndex: ['requester', 'fullName'],
      key: 'requester.fullName',
      width: 160,
      render: (name: string, record: Ticket) => (
        <Space size="small">
          <UserOutlined style={{ color: '#8c8c8c' }} />
          <span>{name || record.requester?.email}</span>
        </Space>
      ),
    },
    {
      title: 'Assignee',
      dataIndex: ['assignedTo', 'fullName'],
      key: 'assignedTo.fullName',
      width: 160,
      render: (name: string | undefined) => (
        name ? (
          <Text strong style={{ color: '#262626' }}>{name}</Text>
        ) : (
          <Text type="secondary" italic>Unassigned</Text>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: TicketStatus) => <StatusTag status={status} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (priority: TicketPriority) => <PriorityTag priority={priority} />,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 130,
      render: (date: string | null) => {
        if (!date) return <Text type="secondary">—</Text>;
        const isPast = dayjs(date).isBefore(dayjs());
        return (
          <span style={{ color: isPast ? '#cf1322' : 'inherit' }}>
            {dayjs(date).format('MMM D, YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      width: 130,
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      fixed: 'right' as const,
      render: (_: unknown, record: Ticket) => (
        <Space size="small">
          <Tooltip title="View Ticket Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/tickets/${record.id}`)}
            />
          </Tooltip>

          {(user?.role === 'ADMIN' || user?.role === 'AGENT' || user?.id === record.requester.id) && (
            <Tooltip title="Edit Title & Description">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleOpenEdit(record)}
              />
            </Tooltip>
          )}

          <Tooltip title="Duplicate / Clone Ticket">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={() => handleOpenDuplicate(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Title & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Tickets Directory
          </Title>
          <Text type="secondary">
            Manage, filter, triage, and assign enterprise customer support requests
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchTickets} loading={loading}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
          >
            Create Ticket
          </Button>
        </Space>
      </div>

      {/* Filter and Search Bar */}
      <Card bordered bodyStyle={{ padding: '16px 20px' }}>
        <Space wrap size="middle" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space wrap size="middle">
            {/* Search Input */}
            <Input
              placeholder="Search by ticket #, title, or keywords..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />

            {/* Status Filter */}
            <Select
              placeholder="Status: All"
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(0);
              }}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="OPEN">Open</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="PENDING">Pending</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>

            {/* Priority Filter */}
            <Select
              placeholder="Priority: All"
              value={priorityFilter}
              onChange={(val) => {
                setPriorityFilter(val);
                setCurrentPage(0);
              }}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="URGENT">Urgent</Option>
              <Option value="HIGH">High</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="LOW">Low</Option>
            </Select>

            {/* Category Filter */}
            <Select
              placeholder="Category: All"
              value={categoryFilter}
              onChange={(val) => {
                setCategoryFilter(val);
                setCurrentPage(0);
              }}
              style={{ width: 170 }}
              allowClear
            >
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>

            {/* Assignee Filter (for staff) */}
            {(user?.role === 'ADMIN' || user?.role === 'AGENT') && (
              <Select
                placeholder="Assignee: All"
                value={assigneeFilter}
                onChange={(val) => {
                  setAssigneeFilter(val);
                  setCurrentPage(0);
                }}
                style={{ width: 180 }}
                allowClear
              >
                {assignees.map((u) => (
                  <Option key={u.id} value={u.id}>
                    {u.fullName}
                  </Option>
                ))}
              </Select>
            )}

            {/* Clear All Filters */}
            {(statusFilter || priorityFilter || categoryFilter || assigneeFilter || searchQuery) && (
              <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </Space>

          <Text type="secondary" style={{ fontSize: 13 }}>
            Showing {tickets.length} of {totalElements} tickets
          </Text>
        </Space>
      </Card>

      {/* Tickets Table */}
      <Card bordered bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={tickets}
          loading={loading || isPending}
          onChange={handleTableChange}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20', '50'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tickets`,
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchTickets();
        }}
      />

      {/* Edit Ticket Modal */}
      <Modal
        title={`Edit Ticket #${editingTicket?.ticketNumber || ''}`}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingTicket(null);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={modalSubmitting}
        okText="Save Changes"
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveEdit}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Duplicate Ticket Modal */}
      <Modal
        title="Duplicate / Clone Ticket"
        open={duplicateModalOpen}
        onCancel={() => {
          setDuplicateModalOpen(false);
          setDuplicatingTicketId(null);
        }}
        onOk={() => duplicateForm.submit()}
        confirmLoading={modalSubmitting}
        okText="Duplicate Ticket"
        destroyOnClose
      >
        <Form
          form={duplicateForm}
          layout="vertical"
          onFinish={handleSaveDuplicate}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            name="title"
            label="Cloned Ticket Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select>
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select priority' }]}
            >
              <Select>
                <Option value="LOW">Low</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="HIGH">High</Option>
                <Option value="URGENT">Urgent</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
