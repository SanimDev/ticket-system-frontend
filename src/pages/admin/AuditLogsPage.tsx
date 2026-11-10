import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Typography,
  Tag,
  Space,
  Button,
  Modal,
  Avatar,
  message,
  Row,
  Col,
} from 'antd';
import {
  HistoryOutlined,
  UserOutlined,
  ReloadOutlined,
  EyeOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { adminApi } from '../../api/admin';
import { RoleTag } from '../../components/RoleTag';
import type { AuditLog } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  // Inspection modal
  const [inspectModalOpen, setInspectModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAuditLogs(currentPage, pageSize);
      setLogs(res.content);
      setTotalElements(res.totalElements);
    } catch {
      message.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleInspect = (log: AuditLog) => {
    setSelectedLog(log);
    setInspectModalOpen(true);
  };

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      key: 'actor',
      width: 200,
      render: (actor: AuditLog['actor']) => (
        <Space size="small">
          <Avatar size="small" style={{ backgroundColor: '#722ed1' }} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: 13, display: 'block' }}>
              {actor?.fullName || 'System Event'}
            </Text>
            {actor?.role && <RoleTag role={actor.role} />}
          </div>
        </Space>
      ),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action: string) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: 'Target Entity',
      key: 'entity',
      width: 150,
      render: (_: unknown, record: AuditLog) => (
        <Space size={4}>
          <Tag color="cyan">{record.entityType}</Tag>
          <Text code>#{record.entityId}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => <Text>{desc}</Text>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
      render: (ip: string) => <Text code>{ip}</Text>,
    },
    {
      title: 'Inspect',
      key: 'inspect',
      width: 90,
      render: (_: unknown, record: AuditLog) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleInspect(record)}
        >
          Diff
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Title & Refresh */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Security & Audit Logs
          </Title>
          <Text type="secondary">
            Immutable operational audit trail of system events, role changes, and data modifications
          </Text>
        </div>

        <Button icon={<ReloadOutlined />} onClick={fetchLogs} loading={loading}>
          Refresh
        </Button>
      </div>

      {/* Audit Logs Table */}
      <Card bordered bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={logs}
          loading={loading}
          pagination={{
            current: currentPage + 1,
            pageSize,
            total: totalElements,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (page, size) => {
              setCurrentPage(page - 1);
              setPageSize(size);
            },
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} logs`,
          }}
          size="middle"
        />
      </Card>

      {/* JSON Diff / Payload Inspector Modal */}
      <Modal
        title={
          <Space>
            <HistoryOutlined style={{ color: '#1677ff' }} />
            <span>Audit Event #{selectedLog?.id} Details</span>
          </Space>
        }
        open={inspectModalOpen}
        onCancel={() => setInspectModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setInspectModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={720}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text strong>Action: {selectedLog.action}</Text>
                <Text type="secondary">{dayjs(selectedLog.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
              </div>
              <div><Text type="secondary">Target: </Text><Text strong>{selectedLog.entityType} #{selectedLog.entityId}</Text></div>
              <div><Text type="secondary">Actor: </Text><Text strong>{selectedLog.actor?.fullName} ({selectedLog.actor?.email})</Text></div>
              <div><Text type="secondary">Client IP: </Text><Text code>{selectedLog.ipAddress}</Text></div>
              <div style={{ marginTop: 6 }}><Text>{selectedLog.description}</Text></div>
            </div>

            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card
                  title={<Space><CodeOutlined style={{ color: '#ff4d4f' }} /><span>Previous State (Old)</span></Space>}
                  size="small"
                  bordered
                  style={{ backgroundColor: '#fff1f0' }}
                >
                  <pre style={{ margin: 0, fontSize: 12, maxHeight: 240, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {selectedLog.oldValues || 'null (No previous values or created)'}
                  </pre>
                </Card>
              </Col>

              <Col span={12}>
                <Card
                  title={<Space><CodeOutlined style={{ color: '#52c41a' }} /><span>New State (Modified)</span></Space>}
                  size="small"
                  bordered
                  style={{ backgroundColor: '#f6ffed' }}
                >
                  <pre style={{ margin: 0, fontSize: 12, maxHeight: 240, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                    {selectedLog.newValues || 'null (No new values or deleted)'}
                  </pre>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

