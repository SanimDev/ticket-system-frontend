import React from 'react';
import { Tag } from 'antd';
import { CrownOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import type { Role } from '../types';

interface RoleTagProps {
  role: Role;
}

export const RoleTag: React.FC<RoleTagProps> = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return (
        <Tag color="purple" icon={<CrownOutlined />}>
          ADMIN
        </Tag>
      );
    case 'AGENT':
      return (
        <Tag color="geekblue" icon={<ToolOutlined />}>
          AGENT
        </Tag>
      );
    case 'CUSTOMER':
      return (
        <Tag color="green" icon={<UserOutlined />}>
          CUSTOMER
        </Tag>
      );
    default:
      return <Tag>{role}</Tag>;
  }
};

