# 🎧 Helpdesk Pro — Frontend SPA Developer Guide

> Production-grade Single Page Application (SPA) for a modern Helpdesk / Support Ticket Management System built with **React 18+**, **TypeScript (Strict Mode)**, **Ant Design v5**, **Zustand**, and **Recharts**, connecting to a Spring Boot REST API (`http://localhost:8080/api`).

---

## 📑 Table of Contents
1. [Tech Stack & Architecture](#-tech-stack--architecture)
2. [Project Structure](#-project-structure)
3. [Quick Start & Setup](#-quick-start--setup)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
5. [Demo Mode vs. Live Backend Mode](#-demo-mode-vs-live-backend-mode)
6. [Developer How-To Guides (Easy to Update)](#-developer-how-to-guides-easy-to-update)
   - [How to Add a New Page & Route](#1-how-to-add-a-new-page--route)
   - [How to Add a New API Endpoint](#2-how-to-add-a-new-api-endpoint)
   - [How to Add or Change Ticket Statuses / Priorities](#3-how-to-add-or-change-ticket-statuses--priorities)
   - [How to Customize Ant Design Theme & Colors](#4-how-to-customize-ant-design-theme--colors)
   - [How to Add New Navigation Menu Items](#5-how-to-add-new-navigation-menu-items)
7. [Spring Boot Backend Integration](#-spring-boot-backend-integration)
8. [Available npm Scripts](#-available-npm-scripts)

---

## 🚀 Tech Stack & Architecture

- **Framework**: React 18+ / React 19 with strict TypeScript
- **UI Library**: Ant Design v5 (`antd`, `@ant-design/icons`)
- **Routing**: `react-router-dom` v6/v7 with role-guarded routes
- **State Management**: `zustand` with persistence in `localStorage`
- **HTTP Client**: `axios` with automated Bearer tokens, centralized error handling, and 401 redirect
- **Date Handling**: `dayjs` (Ant Design native)
- **Data Visualization**: `recharts` for KPI status and priority distribution charts
- **Bundler**: `vite` with vendor chunk splitting (`antd-vendor`, `charts-vendor`, `react-vendor`)

---

## 📁 Project Structure

```text
src/
├── api/                  # HTTP client, REST API endpoints & fallback mock database
│   ├── client.ts         # Axios instance with request/response interceptors & 401 handling
│   ├── auth.ts           # Login, Register, Current User profile APIs
│   ├── tickets.ts        # Tickets CRUD, Status, Assignment, Comments, Duplicate
│   ├── categories.ts     # Categories API (Active list & Admin CRUD)
│   ├── dashboard.ts      # KPI summary metrics & recent tickets
│   ├── admin.ts          # User management, eligible assignees, audit logs
│   └── mockData.ts       # In-memory mock database & realistic initial seed data
├── components/           # Reusable UI components
│   ├── StatusTag.tsx     # Color-coded badge for OPEN, IN_PROGRESS, PENDING, RESOLVED, CLOSED
│   ├── PriorityTag.tsx   # Color-coded tag for LOW, MEDIUM, HIGH, URGENT
│   ├── RoleTag.tsx       # Role tag for ADMIN, AGENT, CUSTOMER
│   └── ProtectedRoute.tsx# RBAC route guard & permission checker
├── layouts/              # Shell layouts
│   ├── MainLayout.tsx    # Collapsible sidebar, header, user menu, global create ticket modal
│   └── AuthLayout.tsx    # Clean centered shell for login & registration
├── pages/                # Application views
│   ├── auth/
│   │   ├── LoginPage.tsx      # Login form with 1-click test credential fill buttons
│   │   └── RegisterPage.tsx   # Customer self-registration form
│   ├── dashboard/
│   │   └── DashboardPage.tsx  # KPI statistics cards, Donut & Bar charts, recent tickets
│   ├── tickets/
│   │   ├── TicketListPage.tsx    # Paginated, sorted, debounced search & filter table
│   │   ├── TicketDetailPage.tsx  # 2-column view, comments, internal notes, history timeline
│   │   └── CreateTicketModal.tsx # Dynamic category selector, priority, due date
│   └── admin/
│       ├── UserManagementPage.tsx     # User accounts table with activation switch
│       ├── CategoryManagementPage.tsx # Category management with add/edit modals
│       └── AuditLogsPage.tsx          # Security & audit logs with JSON diff inspector
├── store/
│   └── authStore.ts      # Persistent Zustand auth store (token, user, demoMode)
├── types/
│   └── index.ts          # Complete TypeScript interfaces matching backend models
└── App.tsx               # Root application routes and Ant Design ConfigProvider
```

---

## ⚡ Quick Start & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional)
By default, the client points to `http://localhost:8080/api`. To change the backend URL, create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Quick Test Login Credentials
The login page provides 1-click demo role fillers:
- **Admin**: `admin@helpdesk.com` / `password123`
- **Agent**: `agent@helpdesk.com` / `password123`
- **Customer**: `customer@helpdesk.com` / `password123`

---

## 🔑 Role-Based Access Control (RBAC)

| Page / Capability | CUSTOMER | AGENT | ADMIN |
|---|:---:|:---:|:---:|
| **Dashboard** | ✅ View | ✅ View | ✅ View |
| **View Tickets & Details** | ✅ Own tickets | ✅ All tickets | ✅ All tickets |
| **Create Ticket** | ✅ | ✅ | ✅ |
| **Add Public Comments** | ✅ | ✅ | ✅ |
| **Add Internal Staff Notes** | ❌ Hidden | ✅ Visible | ✅ Visible |
| **Assign Agent** | ❌ | ✅ | ✅ |
| **Update Status & Priority** | ❌ (View only) | ✅ | ✅ |
| **Categories Management** | ❌ (403) | ❌ (403) | ✅ Full CRUD |
| **User Accounts Management** | ❌ (403) | ❌ (403) | ✅ Full CRUD |
| **Security & Audit Logs** | ❌ (403) | ❌ (403) | ✅ Full View |

---

## 🔄 Demo Mode vs. Live Backend Mode

- **Live Mode**: Directly sends HTTP requests to your Spring Boot REST API at `http://localhost:8080/api`.
- **Automatic Fallback / Mock Mode**: If the Spring Boot backend is offline or returns `ERR_NETWORK`, the application automatically falls back to an in-memory mock engine so the UI remains 100% interactive for testing.
- **Manual Toggle**: Use the **Live API / Mock Mode** switch in the top header bar to toggle modes at any time.

---

## 🛠️ Developer How-To Guides (Easy to Update)

### 1. How to Add a New Page & Route

1. **Create the page component** in `src/pages/`:
   ```tsx
   // src/pages/reports/ReportsPage.tsx
   import React from 'react';
   import { Card, Typography } from 'antd';

   export const ReportsPage: React.FC = () => {
     return (
       <Card title="Support SLA Reports">
         <Typography.Text>Report data goes here...</Typography.Text>
       </Card>
     );
   };
   ```

2. **Register the route** in `src/App.tsx`:
   ```tsx
   // In src/App.tsx inside <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
   <Route
     path="/admin/reports"
     element={
       <ProtectedRoute allowedRoles={['ADMIN']}>
         <ReportsPage />
       </ProtectedRoute>
     }
   />
   ```

3. **Add navigation link** in `src/layouts/MainLayout.tsx` under `menuItems`:
   ```tsx
   {
     key: '/admin/reports',
     icon: <BarChartOutlined />,
     label: 'SLA Reports',
   }
   ```

---

### 2. How to Add a New API Endpoint

1. **Define the interface** in `src/types/index.ts`:
   ```typescript
   export interface SLAReport {
     averageResponseTimeMinutes: number;
     resolvedWithinSlaPercent: number;
   }
   ```

2. **Add the API call** in `src/api/` (e.g. `src/api/dashboard.ts` or a new module):
   ```typescript
   import apiClient from './client';
   import type { SLAReport } from '../types';

   export const getSLAReport = async (): Promise<SLAReport> => {
     const response = await apiClient.get<SLAReport>('/dashboard/sla');
     return response.data;
   };
   ```

3. **(Optional)** Add mock response in `src/api/mockData.ts` if you want it supported in Mock Mode.

---

### 3. How to Add or Change Ticket Statuses / Priorities

1. **Update the TypeScript types** in `src/types/index.ts`:
   ```typescript
   export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED' | 'ON_HOLD';
   ```

2. **Update the visual tag component** in `src/components/StatusTag.tsx`:
   ```tsx
   case 'ON_HOLD':
     return <Tag color="purple">ON HOLD</Tag>;
   ```

3. **Update chart colors** in `src/pages/dashboard/DashboardPage.tsx`:
   ```typescript
   const STATUS_COLORS: Record<string, string> = {
     OPEN: '#1677ff',
     IN_PROGRESS: '#fa8c16',
     PENDING: '#faad14',
     RESOLVED: '#52c41a',
     CLOSED: '#8c8c8c',
     ON_HOLD: '#722ed1',
   };
   ```

---

### 4. How to Customize Ant Design Theme & Colors

Edit the theme configuration in `src/App.tsx`:
```tsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1677ff',      // Change primary brand color
      borderRadius: 8,              // Change button & card border radius
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      colorBgContainer: '#ffffff',
    },
  }}
>
```

---

### 5. How to Add New Navigation Menu Items

Open `src/layouts/MainLayout.tsx` and find `menuItems`:
- Items for **all users** go directly into `menuItems`.
- Items for **admins only** go inside the `if (isAdmin)` condition under `admin-group`.

---

## ☕ Spring Boot Backend Integration

### 1. Expected Endpoints
- **Auth**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Dashboard**: `GET /api/dashboard/summary`, `GET /api/dashboard/recent-tickets`
- **Tickets**: `GET /api/tickets`, `POST /api/tickets`, `GET /api/tickets/:id`, `PATCH /api/tickets/:id`, `PATCH /api/tickets/:id/status`, `PATCH /api/tickets/:id/assignment`, `PATCH /api/tickets/:id/priority`, `GET|POST /api/tickets/:id/comments`, `GET /api/tickets/:id/history`, `GET|POST /api/tickets/:id/duplicate`
- **Categories**: `GET /api/categories`, `POST /api/categories`, `PATCH /api/categories/:id`
- **Admin**: `GET /api/admin/users`, `PATCH /api/admin/users/:id/status`, `GET /api/admin/assignees`, `GET /api/admin/audit-logs`

### 2. Spring Boot CORS Configuration
Ensure your Spring Boot backend allows requests from `http://localhost:3000`:
```java
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

## 📜 Available npm Scripts

```bash
# Start local Vite development server
npm run dev

# Run TypeScript compilation and build production output
npm run build

# Run fast code linting
npm run lint

# Preview the production build locally
npm run preview
```
