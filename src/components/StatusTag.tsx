import React from 'react';
import { Tag } from 'antd';
import {
  ClockCircleOutlined,
  SyncOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import type { TicketStatus } from '../types';

interface StatusTagProps {
  status: TicketStatus;
  showIcon?: boolean;
}

export const StatusTag: React.FC<StatusTagProps> = ({ status, showIcon = true }) => {
  switch (status) {
    case 'OPEN':
      return (
        <Tag color="blue" icon={showIcon ? <ClockCircleOutlined /> : undefined}>
          OPEN
        </Tag>
      );
    case 'IN_PROGRESS':
      return (
        <Tag color="orange" icon={showIcon ? <SyncOutlined spin /> : undefined}>
          IN PROGRESS
        </Tag>
      );
    case 'PENDING':
      return (
        <Tag color="gold" icon={showIcon ? <PauseCircleOutlined /> : undefined}>
          PENDING
        </Tag>
      );
    case 'RESOLVED':
      return (
        <Tag color="green" icon={showIcon ? <CheckCircleOutlined /> : undefined}>
          RESOLVED
        </Tag>
      );
    case 'CLOSED':
      return (
        <Tag color="default" icon={showIcon ? <CloseCircleOutlined /> : undefined}>
          CLOSED
        </Tag>
      );
    default:
      return <Tag>{status}</Tag>;
  }
};

