import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Typography,
  Switch,
  Space,
  Avatar,
  message,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
} from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { RoleTag } from '../../components/RoleTag';
import type { User } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers(currentPage, pageSize);
      setUsers(res.content);
      setTotalElements(res.totalElements);
    } catch {
      message.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (user: User, checked: boolean) => {
    try {
      setTogglingId(user.id);
      await adminApi.toggleUserStatus(user.id, checked);
      message.success(
        `User ${user.fullName} has been ${checked ? 'activated' : 'deactivated'}`
      );
      // Update local state directly for snappy UX
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, active: checked } : u))
      );
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (_: unknown, record: User) => (
        <Space size="middle">
          <Avatar
            style={{
              backgroundColor:
                record.role === 'ADMIN'
                  ? '#722ed1'
                  : record.role === 'AGENT'
                  ? '#1677ff'
                  : '#52c41a',
            }}
            icon={<UserOutlined />}
          />
          <div>
            <Text strong style={{ display: 'block' }}>{record.fullName}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 140,
      render: (role: User['role']) => <RoleTag role={role} />,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 130,
      render: (active: boolean) => (
        active ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag>
        ) : (
          <Tag color="error" icon={<StopOutlined />}>Disabled</Tag>
        )
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Account Access',
      key: 'toggle',
      width: 150,
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Switch
            checked={record.active}
            loading={togglingId === record.id}
            onChange={(checked) => handleToggleStatus(record, checked)}
            checkedChildren="Enabled"
            unCheckedChildren="Disabled"
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            User Management
          </Title>
          <Text type="secondary">
            Manage system access, roles, and account activation states
          </Text>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchUsers} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* KPI Stats */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered>
            <Statistic
              title="Total Accounts"
              value={totalElements}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered>
            <Statistic
              title="Active Accounts"
              value={users.filter((u) => u.active).length}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered>
            <Statistic
              title="Disabled Accounts"
              value={users.filter((u) => !u.active).length}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<StopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered>
            <Statistic
              title="Staff Members"
              value={users.filter((u) => u.role === 'ADMIN' || u.role === 'AGENT').length}
              valueStyle={{ color: '#722ed1' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Users Table */}
      <Card bordered bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '20'],
            onChange: (page, size) => {
              setCurrentPage(page - 1);
              setPageSize(size);
            },
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
          }}
          size="middle"
        />
      </Card>
    </div>
  );
};

