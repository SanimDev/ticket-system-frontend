import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Button,
  Space,
  Typography,
  Skeleton,
  message,
} from 'antd';
import {
  InboxOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  PlusOutlined,
  ArrowRightOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { dashboardApi } from '../../api/dashboard';
import { StatusTag } from '../../components/StatusTag';
import { PriorityTag } from '../../components/PriorityTag';
import { CreateTicketModal } from '../tickets/CreateTicketModal';
import type { DashboardSummary, Ticket } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#1677ff',
  IN_PROGRESS: '#fa8c16',
  PENDING: '#faad14',
  RESOLVED: '#52c41a',
  CLOSED: '#8c8c8c',
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#ff4d4f',
  HIGH: '#fa8c16',
  MEDIUM: '#1677ff',
  LOW: '#13c2c2',
};

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const navigate = useNavigate();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [summaryRes, recentRes] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getRecentTickets(5),
      ]);
      setSummary(summaryRes);
      setRecentTickets(recentRes.content);
    } catch {
      message.error('Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Format Status Chart data
  const statusChartData = summary
    ? Object.entries(summary.statusCounts).map(([status, count]) => ({
        name: status.replace('_', ' '),
        rawStatus: status,
        value: count,
      }))
    : [];

  // Format Priority Chart data
  const priorityChartData = summary
    ? Object.entries(summary.priorityCounts).map(([priority, count]) => ({
        name: priority,
        rawPriority: priority,
        count: count,
      }))
    : [];

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      width: 140,
      render: (num: string, record: Ticket) => (
        <Link to={`/tickets/${record.id}`} style={{ fontWeight: 600 }}>
          {num}
        </Link>
      ),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title: string, record: Ticket) => (
        <div>
          <Text strong style={{ cursor: 'pointer' }} onClick={() => navigate(`/tickets/${record.id}`)}>
            {title}
          </Text>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            Category: {record.category?.name || 'General'}
          </div>
        </div>
      ),
    },
    {
      title: 'Requester',
      dataIndex: ['requester', 'fullName'],
      key: 'requester',
      width: 160,
      render: (name: string) => name || 'Anonymous',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: Ticket['status']) => <StatusTag status={status} />,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 110,
      render: (priority: Ticket['priority']) => <PriorityTag priority={priority} />,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      width: 90,
      render: (_: unknown, record: Ticket) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/tickets/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Support Operations Dashboard
          </Title>
          <Text type="secondary">
            Overview of ticket workloads, resolution queues, and system status
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={loadDashboardData} loading={loading}>
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

      {/* KPI Statistic Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={4}>
          <Card bordered hoverable style={{ borderTop: '3px solid #1677ff' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Total Tickets"
                value={summary?.totalTickets ?? 0}
                prefix={<InboxOutlined style={{ color: '#1677ff' }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Card bordered hoverable style={{ borderTop: '3px solid #1677ff' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Open"
                value={summary?.openTickets ?? 0}
                prefix={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Card bordered hoverable style={{ borderTop: '3px solid #fa8c16' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="In Progress"
                value={summary?.inProgressTickets ?? 0}
                prefix={<SyncOutlined spin={false} style={{ color: '#fa8c16' }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Card bordered hoverable style={{ borderTop: '3px solid #faad14' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Pending"
                value={summary?.pendingTickets ?? 0}
                prefix={<PauseCircleOutlined style={{ color: '#faad14' }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Card bordered hoverable style={{ borderTop: '3px solid #52c41a' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Resolved"
                value={summary?.resolvedTickets ?? 0}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              />
            </Skeleton>
          </Card>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <Card bordered hoverable style={{ borderTop: '3px solid #8c8c8c' }}>
            <Skeleton loading={loading} active paragraph={{ rows: 1 }}>
              <Statistic
                title="Closed"
                value={summary?.closedTickets ?? 0}
                prefix={<CloseCircleOutlined style={{ color: '#8c8c8c' }} />}
              />
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Visual Analytics Row */}
      <Row gutter={[16, 16]}>
        {/* Status Breakdown (Donut Chart) */}
        <Col xs={24} lg={12}>
          <Card
            title="Ticket Status Distribution"
            bordered
            style={{ height: '100%' }}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>Active Lifecycle</Text>}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
              {statusChartData.length > 0 ? (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusChartData.map((entry) => (
                          <Cell
                            key={`cell-${entry.rawStatus}`}
                            fill={STATUS_COLORS[entry.rawStatus] || '#1677ff'}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                  No ticket status data available
                </div>
              )}
            </Skeleton>
          </Card>
        </Col>

        {/* Priority Breakdown (Bar Chart) */}
        <Col xs={24} lg={12}>
          <Card
            title="Tickets by Priority"
            bordered
            style={{ height: '100%' }}
            extra={<Text type="secondary" style={{ fontSize: 12 }}>Severity Breakdown</Text>}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
              {priorityChartData.length > 0 ? (
                <div style={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={priorityChartData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip />
                      <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                        {priorityChartData.map((entry) => (
                          <Cell
                            key={`bar-${entry.rawPriority}`}
                            fill={PRIORITY_COLORS[entry.rawPriority] || '#1677ff'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                  No priority data available
                </div>
              )}
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* Recent Tickets Table */}
      <Card
        title="Recently Updated Tickets"
        bordered
        extra={
          <Link to="/tickets">
            <Button type="link" icon={<ArrowRightOutlined />}>
              View All Tickets
            </Button>
          </Link>
        }
      >
        <Table
          rowKey="id"
          columns={columns}
          dataSource={recentTickets}
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Quick Create Ticket Modal */}
      <CreateTicketModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          loadDashboardData();
        }}
      />
    </div>
  );
};

