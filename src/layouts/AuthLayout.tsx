import React from 'react';
import { Outlet } from 'react-router-dom';
import { Layout, Typography, Space } from 'antd';
import { CustomerServiceFilled } from '@ant-design/icons';

const { Content, Footer } = Layout;
const { Title, Text } = Typography;
const currentYear = new Date().getFullYear();

export const AuthLayout: React.FC = () => {
  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Space align="center" style={{ marginBottom: 8 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: '#1677ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: 24,
                boxShadow: '0 4px 12px rgba(22, 119, 255, 0.4)',
              }}
            >
              <CustomerServiceFilled />
            </div>
            <Title level={2} style={{ color: '#ffffff', margin: 0, fontWeight: 700 }}>
              Helpdesk Pro
            </Title>
          </Space>
          <div>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>
              Enterprise Support & Ticket Management System
            </Text>
          </div>
        </div>

        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', background: 'transparent', color: '#64748b' }}>
        Helpdesk System © {currentYear} — Connected to Spring Boot REST API
      </Footer>
    </Layout>
  );
};
