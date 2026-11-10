import React from 'react';
import { Tag } from 'antd';
import {
  FireOutlined,
  ArrowUpOutlined,
  MinusOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import type { TicketPriority } from '../types';

interface PriorityTagProps {
  priority: TicketPriority;
  showIcon?: boolean;
}

export const PriorityTag: React.FC<PriorityTagProps> = ({ priority, showIcon = true }) => {
  switch (priority) {
    case 'URGENT':
      return (
        <Tag color="red" icon={showIcon ? <FireOutlined /> : undefined}>
          URGENT
        </Tag>
      );
    case 'HIGH':
      return (
        <Tag color="orange" icon={showIcon ? <ArrowUpOutlined /> : undefined}>
          HIGH
        </Tag>
      );
    case 'MEDIUM':
      return (
        <Tag color="blue" icon={showIcon ? <MinusOutlined /> : undefined}>
          MEDIUM
        </Tag>
      );
    case 'LOW':
      return (
        <Tag color="cyan" icon={showIcon ? <ArrowDownOutlined /> : undefined}>
          LOW
        </Tag>
      );
    default:
      return <Tag>{priority}</Tag>;
  }
};

