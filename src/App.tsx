import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntdApp, Result, Button } from 'antd';
import { AuthLayout } from './layouts/AuthLayout';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { TicketListPage } from './pages/tickets/TicketListPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { CategoryManagementPage } from './pages/admin/CategoryManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';

  const App: React.FC = () => {
    const { isAuthenticated } = useAuthStore();

    return (
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#1677ff',
              borderRadius: 8,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              colorBgContainer: '#ffffff',
            },
          }}
        >
          <AntdApp>
            <BrowserRouter>
              <Routes>
                {/* Root Route Redirect */}
                <Route
                  path="/"
                  element={
                    <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />
                  }
                />

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                </Route>

                {/* Authenticated Protected Shell */}
                <Route
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/tickets" element={<TicketListPage />} />
                  <Route path="/tickets/:id" element={<TicketDetailPage />} />

                {/* Admin-only Routes with RBAC */}
                <Route
                  path="/admin/categories"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <CategoryManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 Catch-All */}
              <Route
                path="*"
                element={
                  <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                    <Result
                      status="404"
                      title="404 - Page Not Found"
                      subTitle="Sorry, the page you visited does not exist or has been moved."
                      extra={
                        <Button type="primary" href="/dashboard">
                          Back to Dashboard
                        </Button>
                      }
                    />
                  </div>
                }
              />
            </Routes>
          </BrowserRouter>
        </AntdApp>
      </ConfigProvider >
  );
};

export default App;
