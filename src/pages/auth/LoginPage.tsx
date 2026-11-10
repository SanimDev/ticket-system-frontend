import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Divider,
  Space,
  Tag,
  Alert,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  LoginOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import type { LoginRequest, Role } from '../../types';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination after successful login
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginRequest & { remember?: boolean }) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await authApi.login({
        email: values.email,
        password: values.password,
      });

      login(response);
      message.success(`Welcome back, ${response.user.fullName}!`);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      setErrorMessage(
        errObj.response?.data?.message || errObj.message || 'Login failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing/evaluating
  const handleQuickLogin = (role: Role) => {
    let email = 'admin@helpdesk.com';
    if (role === 'AGENT') email = 'agent@helpdesk.com';
    if (role === 'CUSTOMER') email = 'customer@helpdesk.com';

    form.setFieldsValue({
      email,
      password: 'password123',
      remember: true,
    });
  };

  return (
    <Card
      style={{
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        borderRadius: 12,
        border: '1px solid #334155',
        backgroundColor: '#ffffff',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Sign In
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Enter your credentials to access your support workspace
        </Text>
      </div>

      {errorMessage && (
        <Alert
          message={errorMessage}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        name="login_form"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        <Form.Item
          name="email"
          label="Email Address"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email address!' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
            placeholder="e.g. admin@helpdesk.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Forgot password? Contact admin
            </span>
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<LoginOutlined />}
            loading={loading}
            block
            style={{ height: 42, fontWeight: 600 }}
          >
            Sign In
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Register as Customer
            </Link>
          </Text>
        </div>
      </Form>

      <Divider style={{ margin: '20px 0 16px 0', fontSize: 12, color: '#94a3b8' }}>
        <Space size={4}>
          <ThunderboltOutlined style={{ color: '#faad14' }} />
          <span>Quick Demo Roles</span>
        </Space>
      </Divider>

      <Space wrap style={{ width: '100%', justifyContent: 'center' }}>
        <Tag
          color="purple"
          style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}
          onClick={() => handleQuickLogin('ADMIN')}
        >
          Fill Admin
        </Tag>
        <Tag
          color="geekblue"
          style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}
          onClick={() => handleQuickLogin('AGENT')}
        >
          Fill Agent
        </Tag>
        <Tag
          color="green"
          style={{ cursor: 'pointer', padding: '4px 10px', fontSize: 12 }}
          onClick={() => handleQuickLogin('CUSTOMER')}
        >
          Fill Customer
        </Tag>
      </Space>
    </Card>
  );
};

