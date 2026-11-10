import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Space,
  Button,
  Badge,
  Modal,
  Descriptions,
  Switch,
  Tooltip,
  type MenuProps,
} from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  AppstoreOutlined,
  TeamOutlined,
  HistoryOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CustomerServiceFilled,
  ApiOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../store/authStore';
import { RoleTag } from '../components/RoleTag';
import { CreateTicketModal } from '../pages/tickets/CreateTicketModal';
import dayjs from 'dayjs';

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;
const currentYear = new Date().getFullYear();

export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { user, logout, demoMode, setDemoMode } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build menu items based on role
  const isAdmin = user?.role === 'ADMIN';

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/tickets',
      icon: <FileTextOutlined />,
      label: 'Tickets',
    },
    {
      key: 'create-ticket-action',
      icon: <PlusCircleOutlined />,
      label: 'Create Ticket',
    },
    ...(isAdmin
      ? [
        {
          type: 'divider' as const,
        },
        {
          key: 'admin-group',
          label: 'ADMINISTRATION',
          type: 'group' as const,
          children: [
            {
              key: '/admin/categories',
              icon: <AppstoreOutlined />,
              label: 'Categories',
            },
            {
              key: '/admin/users',
              icon: <TeamOutlined />,
              label: 'User Management',
            },
            {
              key: '/admin/audit-logs',
              icon: <HistoryOutlined />,
              label: 'Audit Logs',
            },
          ],
        },
      ]
      : []),
  ];

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    if (e.key === 'create-ticket-action') {
      setCreateModalOpen(true);
      return;
    }
    navigate(e.key);
  };

  // User Dropdown items
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile-info',
      disabled: true,
      label: (
        <div style={{ padding: '4px 0', minWidth: 180 }}>
          <Text strong style={{ display: 'block' }}>{user?.fullName}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{user?.email}</Text>
          <div style={{ marginTop: 6 }}>
            {user?.role && <RoleTag role={user.role} />}
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'view-profile',
      icon: <UserOutlined />,
      label: 'View Profile',
      onClick: () => setProfileModalOpen(true),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Sign Out',
      onClick: handleLogout,
    },
  ];

  // Derive current path for selected menu
  const selectedKey = location.pathname.startsWith('/tickets/') && location.pathname !== '/tickets'
    ? '/tickets'
    : location.pathname;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(val) => setCollapsed(val)}
        trigger={null}
        theme="light"
        width={240}
        style={{
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          zIndex: 10,
          borderRight: '1px solid #f0f0f0',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            padding: collapsed ? '0 16px' : '0 20px',
            borderBottom: '1px solid #f0f0f0',
            transition: 'all 0.2s',
          }}
        >
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <CustomerServiceFilled />
            </div>
            {!collapsed && (
              <span
                style={{
                  marginLeft: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#1e293b',
                  whiteSpace: 'nowrap',
                }}
              >
                Helpdesk Pro
              </span>
            )}
          </Link>
        </div>

        {/* Sidebar Menu */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      {/* Main Body */}
      <Layout>
        {/* Top Header */}
        <Header
          style={{
            padding: '0 24px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            height: 64,
            lineHeight: '64px',
          }}
        >
          {/* Left: Collapse Button */}
          <Space size="middle">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16, width: 40, height: 40 }}
            />
          </Space>

          {/* Right: Actions, Demo Toggle & User Avatar */}
          <Space size="large">
            {/* Quick Create Ticket */}
            <Button
              type="primary"
              icon={<PlusCircleOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              New Ticket
            </Button>

            {/* Backend / Demo Mode Switcher */}
            <Tooltip title="Toggle between Live Spring Boot backend (http://localhost:8080/api) and Mock Mode">
              <Space size="small" style={{ cursor: 'pointer' }}>
                <ApiOutlined style={{ color: demoMode ? '#faad14' : '#52c41a' }} />
                <Text style={{ fontSize: 12 }}>
                  {demoMode ? 'Mock Mode' : 'Live API'}
                </Text>
                <Switch
                  size="small"
                  checked={!demoMode}
                  checkedChildren="Live"
                  unCheckedChildren="Mock"
                  onChange={(checked) => setDemoMode(!checked)}
                />
              </Space>
            </Tooltip>

            {/* User Dropdown */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
              <Space style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}>
                <Badge dot status="success" offset={[-2, 28]}>
                  <Avatar
                    style={{
                      backgroundColor: user?.role === 'ADMIN' ? '#722ed1' : user?.role === 'AGENT' ? '#1677ff' : '#52c41a',
                      verticalAlign: 'middle',
                    }}
                    icon={<UserOutlined />}
                  />
                </Badge>
                <div style={{ lineHeight: 1.2, textAlign: 'left', display: 'none', minWidth: 80 }} className="user-text-container">
                  <Text strong style={{ fontSize: 13, display: 'block' }}>
                    {user?.fullName}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {user?.role}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* Content View */}
        <Content
          style={{
            margin: '20px 24px',
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>

        {/* Footer */}
        <Footer style={{ textAlign: 'center', color: '#8c8c8c', padding: '16px 24px' }}>
          Helpdesk Support Portal © {currentYear} — Enterprise Ticket Management
        </Footer>
      </Layout>

      {/* Global Create Ticket Modal */}
      <CreateTicketModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          // Navigate to tickets page if not there
          if (location.pathname !== '/tickets') {
            navigate('/tickets');
          }
        }}
      />

      {/* Profile Details Modal */}
      <Modal
        title="User Profile"
        open={profileModalOpen}
        onOk={() => setProfileModalOpen(false)}
        onCancel={() => setProfileModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setProfileModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        {user && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
            <Descriptions.Item label="Full Name">{user.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email Address">{user.email}</Descriptions.Item>
            <Descriptions.Item label="System Role">
              <RoleTag role={user.role} />
            </Descriptions.Item>
            <Descriptions.Item label="Account Status">
              <Badge status={user.active ? 'success' : 'error'} text={user.active ? 'Active' : 'Disabled'} />
            </Descriptions.Item>
            <Descriptions.Item label="Member Since">
              {dayjs(user.createdAt).format('MMMM D, YYYY h:mm A')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Layout>
  );
};