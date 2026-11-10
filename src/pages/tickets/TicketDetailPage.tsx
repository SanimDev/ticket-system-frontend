import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Breadcrumb,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Button,
  Tag,
  Divider,
  Avatar,
  Form,
  Input,
  Checkbox,
  Modal,
  Select,
  Timeline,
  Spin,
  Empty,
  message,
  Tooltip,
  Badge,
} from 'antd';
import {
  ArrowLeftOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CommentOutlined,
  SendOutlined,
  SwapOutlined,
  UserSwitchOutlined,
  CopyOutlined,
  EditOutlined,
  LockOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  WarningOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { ticketsApi } from '../../api/tickets';
import { categoriesApi } from '../../api/categories';
import { adminApi } from '../../api/admin';
import { StatusTag } from '../../components/StatusTag';
import { PriorityTag } from '../../components/PriorityTag';
import { RoleTag } from '../../components/RoleTag';
import { useAuthStore } from '../../store/authStore';
import type {
  Ticket,
  TicketComment,
  StatusHistory,
  Category,
  User,
  TicketPriority,
  ChangeStatusRequest,
  AssignTicketRequest,
  UpdateTicketRequest,
  DuplicateTicketRequest,
} from '../../types';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Metadata for forms
  const [categories, setCategories] = useState<Category[]>([]);
  const [eligibleAssignees, setEligibleAssignees] = useState<User[]>([]);

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Forms
  const [statusForm] = Form.useForm<ChangeStatusRequest>();
  const [assignForm] = Form.useForm<AssignTicketRequest>();
  const [editForm] = Form.useForm<UpdateTicketRequest>();
  const [duplicateForm] = Form.useForm<DuplicateTicketRequest>();
  const [commentForm] = Form.useForm<{ commentText: string; internalNote: boolean }>();
  const [submittingComment, setSubmittingComment] = useState(false);

  const { user } = useAuthStore();
  const navigate = useNavigate();

  const isStaff = user?.role === 'ADMIN' || user?.role === 'AGENT';
  const isOwner = user?.id === ticket?.requester.id;
  const canModify = isStaff || isOwner;

  // Load ticket details, comments, and history
  const loadTicketData = useCallback(async () => {
    if (!ticketId || isNaN(ticketId)) return;
    try {
      setLoading(true);
      const [t, c, h] = await Promise.all([
        ticketsApi.getTicketById(ticketId),
        ticketsApi.getComments(ticketId),
        ticketsApi.getHistory(ticketId),
      ]);
      setTicket(t);
      setComments(c);
      setHistory(h);
    } catch {
      message.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    loadTicketData();
  }, [loadTicketData]);

  // Load Categories & Eligible Assignees
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [cats, assignees] = await Promise.all([
          categoriesApi.getCategories(false),
          isStaff ? adminApi.getAssignees() : Promise.resolve([]),
        ]);
        setCategories(cats);
        setEligibleAssignees(assignees);
      } catch {
        // Silently continue
      }
    };
    loadMetadata();
  }, [isStaff]);

  // Handlers for workflow actions
  const handleChangeStatus = async (values: ChangeStatusRequest) => {
    try {
      setSubmittingAction(true);
      await ticketsApi.changeStatus(ticketId, values);
      message.success(`Status changed to ${values.status}`);
      setStatusModalOpen(false);
      statusForm.resetFields();
      loadTicketData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to update status');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAssignTicket = async (values: AssignTicketRequest) => {
    try {
      setSubmittingAction(true);
      await ticketsApi.assignTicket(ticketId, { assigneeId: values.assigneeId || null });
      message.success('Assignment updated successfully');
      setAssignModalOpen(false);
      assignForm.resetFields();
      loadTicketData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to assign ticket');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleChangePriority = async (newPriority: TicketPriority) => {
    try {
      await ticketsApi.changePriority(ticketId, { priority: newPriority });
      message.success(`Priority updated to ${newPriority}`);
      loadTicketData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to change priority');
    }
  };

  const handleSaveEdit = async (values: UpdateTicketRequest) => {
    try {
      setSubmittingAction(true);
      await ticketsApi.updateTicket(ticketId, values);
      message.success('Ticket content updated successfully');
      setEditModalOpen(false);
      loadTicketData();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to update ticket');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleOpenDuplicate = async () => {
    try {
      setSubmittingAction(true);
      setDuplicateModalOpen(true);
      const preview = await ticketsApi.getDuplicatePreview(ticketId);
      duplicateForm.setFieldsValue(preview);
    } catch {
      message.error('Failed to load duplicate preview');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleSaveDuplicate = async (values: DuplicateTicketRequest) => {
    try {
      setSubmittingAction(true);
      const cloned = await ticketsApi.duplicateTicket(ticketId, values);
      message.success(`Cloned as ticket #${cloned.ticketNumber}`);
      setDuplicateModalOpen(false);
      navigate(`/tickets/${cloned.id}`);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to duplicate ticket');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddComment = async (values: { commentText: string; internalNote?: boolean }) => {
    if (!values.commentText.trim()) return;
    try {
      setSubmittingComment(true);
      await ticketsApi.addComment(ticketId, {
        commentText: values.commentText.trim(),
        internalNote: !!values.internalNote,
      });
      message.success(values.internalNote ? 'Internal note added' : 'Comment posted');
      commentForm.resetFields();
      const updatedComments = await ticketsApi.getComments(ticketId);
      setComments(updatedComments);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Loading ticket details..." />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <Empty description="Ticket not found">
          <Button type="primary" onClick={() => navigate('/tickets')}>
            Back to Tickets List
          </Button>
        </Empty>
      </Card>
    );
  }

  const isOverdue = ticket.dueDate && dayjs(ticket.dueDate).isBefore(dayjs()) && ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { title: <Link to="/tickets">Tickets</Link> },
          { title: `${ticket.ticketNumber} — ${ticket.title}` },
        ]}
      />

      {/* Ticket Header & Workflow Bar */}
      <Card bordered bodyStyle={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          {/* Left Title & Tags */}
          <div style={{ maxWidth: '65%' }}>
            <Space style={{ marginBottom: 8 }} wrap>
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/tickets')}
              >
                Back
              </Button>
              <Text strong style={{ fontSize: 16, color: '#1677ff' }}>
                {ticket.ticketNumber}
              </Text>
              <StatusTag status={ticket.status} />
              <PriorityTag priority={ticket.priority} />
              <Tag color="cyan">{ticket.category.name}</Tag>
              {ticket.sourceTicketId && (
                <Tag color="purple">
                  Cloned from #{ticket.sourceTicketId}
                </Tag>
              )}
            </Space>

            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
              {ticket.title}
            </Title>
            <Text type="secondary" style={{ fontSize: 13, marginTop: 4, display: 'block' }}>
              Created on {dayjs(ticket.createdAt).format('MMMM D, YYYY [at] h:mm A')} by{' '}
              <Text strong>{ticket.requester.fullName}</Text>
            </Text>
          </div>

          {/* Right Workflow Actions */}
          <Space wrap size="middle">
            {/* Quick Priority Changer (Staff) */}
            {isStaff && (
              <Select
                value={ticket.priority}
                onChange={handleChangePriority}
                style={{ width: 130 }}
                placeholder="Priority"
              >
                <Option value="LOW">Low</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="HIGH">High</Option>
                <Option value="URGENT">Urgent</Option>
              </Select>
            )}

            {/* Change Status Modal Trigger */}
            <Button
              type="primary"
              icon={<SwapOutlined />}
              onClick={() => {
                statusForm.setFieldsValue({ status: ticket.status });
                setStatusModalOpen(true);
              }}
            >
              Update Status
            </Button>

            {/* Assignee Trigger (Staff) */}
            {isStaff && (
              <Button
                icon={<UserSwitchOutlined />}
                onClick={() => {
                  assignForm.setFieldsValue({ assigneeId: ticket.assignedTo?.id ?? null });
                  setAssignModalOpen(true);
                }}
              >
                Assign
              </Button>
            )}

            {/* Edit Ticket (Staff or Creator) */}
            {canModify && (
              <Tooltip title="Edit Title, Description & Category">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    editForm.setFieldsValue({
                      title: ticket.title,
                      description: ticket.description,
                      categoryId: ticket.category.id,
                    });
                    setEditModalOpen(true);
                  }}
                >
                  Edit
                </Button>
              </Tooltip>
            )}

            {/* Duplicate Ticket */}
            <Button icon={<CopyOutlined />} onClick={handleOpenDuplicate}>
              Duplicate
            </Button>
          </Space>
        </div>
      </Card>

      {/* 2-Column Responsive View */}
      <Row gutter={[20, 20]}>
        {/* Left Column: Description + Comments Feed */}
        <Col xs={24} lg={16}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Description Card */}
            <Card title="Problem Description" bordered>
              <Paragraph
                style={{
                  whiteSpace: 'pre-wrap',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: '#334155',
                  marginBottom: 0,
                }}
              >
                {ticket.description}
              </Paragraph>
            </Card>

            {/* Comments & Activity Section */}
            <Card
              title={
                <Space>
                  <CommentOutlined />
                  <span>Discussion & Notes ({comments.length})</span>
                </Space>
              }
              bordered
            >
              {/* Comment Thread */}
              {comments.length === 0 ? (
                <Empty description="No comments or notes yet. Start the conversation below!" />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      style={{
                        padding: 16,
                        borderRadius: 8,
                        backgroundColor: comment.internalNote ? '#fffbe6' : '#f8fafc',
                        border: comment.internalNote ? '1px solid #ffe58f' : '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Space>
                          <Avatar
                            style={{
                              backgroundColor:
                                comment.user.role === 'ADMIN'
                                  ? '#722ed1'
                                  : comment.user.role === 'AGENT'
                                    ? '#1677ff'
                                    : '#52c41a',
                            }}
                            icon={<UserOutlined />}
                          />
                          <div>
                            <Text strong style={{ fontSize: 13 }}>
                              {comment.user.fullName}
                            </Text>
                            <span style={{ marginLeft: 8 }}>
                              <RoleTag role={comment.user.role} />
                            </span>
                          </div>
                        </Space>

                        <Space>
                          {comment.internalNote && (
                            <Tag color="warning" icon={<LockOutlined />}>
                              Internal Staff Note
                            </Tag>
                          )}
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {dayjs(comment.createdAt).format('MMM D, YYYY h:mm A')}
                          </Text>
                        </Space>
                      </div>

                      <div style={{ fontSize: 14, color: '#1e293b', whiteSpace: 'pre-wrap', marginLeft: 40 }}>
                        {comment.commentText}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Divider style={{ margin: '24px 0 16px 0' }} />

              {/* Add Comment Input */}
              <Form form={commentForm} onFinish={handleAddComment} layout="vertical">
                <Form.Item
                  name="commentText"
                  rules={[{ required: true, message: 'Please enter a message' }]}
                  style={{ marginBottom: 12 }}
                >
                  <TextArea
                    rows={4}
                    placeholder="Write a reply or resolution update..."
                  />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* Internal Note checkbox only visible to AGENT and ADMIN */}
                  {isStaff ? (
                    <Form.Item name="internalNote" valuePropName="checked" noStyle>
                      <Checkbox>
                        <Space size={4}>
                          <LockOutlined style={{ color: '#faad14' }} />
                          <Text style={{ fontSize: 13 }}>Internal Staff Note (Customer cannot see)</Text>
                        </Space>
                      </Checkbox>
                    </Form.Item>
                  ) : <div />}

                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SendOutlined />}
                    loading={submittingComment}
                  >
                    Post Reply
                  </Button>
                </div>
              </Form>
            </Card>
          </div>
        </Col>

        {/* Right Column: Metadata, Requester, Assignee, Timeline */}
        <Col xs={24} lg={8}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Requester & Assignee Details */}
            <Card title="People & Assignment" bordered size="small">
              {/* Requester */}
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Requester
                </Text>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                  <Avatar size="large" style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} />
                  <div>
                    <Text strong style={{ display: 'block', fontSize: 14 }}>
                      {ticket.requester.fullName}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {ticket.requester.email}
                    </Text>
                    <div>
                      <RoleTag role={ticket.requester.role} />
                    </div>
                  </div>
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              {/* Assignee */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Assigned Agent
                  </Text>
                  {isStaff && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        assignForm.setFieldsValue({ assigneeId: ticket.assignedTo?.id ?? null });
                        setAssignModalOpen(true);
                      }}
                    >
                      Change
                    </Button>
                  )}
                </div>

                {ticket.assignedTo ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                    <Avatar size="large" style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                    <div>
                      <Text strong style={{ display: 'block', fontSize: 14 }}>
                        {ticket.assignedTo.fullName}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {ticket.assignedTo.email}
                      </Text>
                      <div>
                        <RoleTag role={ticket.assignedTo.role} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 8, padding: '12px', background: '#f5f5f5', borderRadius: 6, textAlign: 'center' }}>
                    <Text type="secondary" italic>Unassigned Ticket</Text>
                    {isStaff && (
                      <div style={{ marginTop: 6 }}>
                        <Button
                          size="small"
                          type="dashed"
                          onClick={() => {
                            assignForm.setFieldsValue({ assigneeId: user?.id });
                            setAssignModalOpen(true);
                          }}
                        >
                          Assign to Me
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Ticket Metadata Card */}
            <Card title="Ticket Metadata" bordered size="small">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Due Date */}
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Due Date</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <CalendarOutlined style={{ color: isOverdue ? '#ff4d4f' : '#8c8c8c' }} />
                    <Text strong style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
                      {ticket.dueDate ? dayjs(ticket.dueDate).format('MMMM D, YYYY h:mm A') : 'No due date set'}
                    </Text>
                    {isOverdue && (
                      <Tag color="error" icon={<WarningOutlined />}>
                        OVERDUE
                      </Tag>
                    )}
                  </div>
                </div>

                {/* Created At */}
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Submitted At</Text>
                  <div style={{ marginTop: 4 }}>
                    <ClockCircleOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                    <Text>{dayjs(ticket.createdAt).format('MMM D, YYYY h:mm A')}</Text>
                  </div>
                </div>

                {/* Updated At */}
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Last Updated</Text>
                  <div style={{ marginTop: 4 }}>
                    <SyncOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
                    <Text>{dayjs(ticket.updatedAt).format('MMM D, YYYY h:mm A')}</Text>
                  </div>
                </div>

                {/* Resolved At */}
                {ticket.resolvedAt && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Resolved At</Text>
                    <div style={{ marginTop: 4 }}>
                      <CheckCircleOutlined style={{ marginRight: 6, color: '#52c41a' }} />
                      <Text>{dayjs(ticket.resolvedAt).format('MMM D, YYYY h:mm A')}</Text>
                    </div>
                  </div>
                )}

                {/* Closed At */}
                {ticket.closedAt && (
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Closed At</Text>
                    <div style={{ marginTop: 4 }}>
                      <Badge status="default" text={dayjs(ticket.closedAt).format('MMM D, YYYY h:mm A')} />
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Status Transition Timeline */}
            <Card
              title={
                <Space>
                  <HistoryOutlined />
                  <span>Workflow History</span>
                </Space>
              }
              bordered
              size="small"
            >
              {history.length === 0 ? (
                <Text type="secondary" italic>No status transitions recorded yet</Text>
              ) : (
                <Timeline
                  mode="left"
                  style={{ marginTop: 12 }}
                  items={history.map((h) => ({
                    color:
                      h.newStatus === 'RESOLVED'
                        ? 'green'
                        : h.newStatus === 'IN_PROGRESS'
                          ? 'orange'
                          : h.newStatus === 'PENDING'
                            ? 'gold'
                            : h.newStatus === 'CLOSED'
                              ? 'gray'
                              : 'blue',
                    children: (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <StatusTag status={h.newStatus} showIcon={false} />
                          <Text strong style={{ fontSize: 12 }}>
                            by {h.changedBy?.fullName || 'System'}
                          </Text>
                        </div>
                        {h.changeReason && (
                          <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                            {h.changeReason}
                          </div>
                        )}
                        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                          {dayjs(h.changedAt).format('MMM D, h:mm A')}
                        </Text>
                      </div>
                    ),
                  }))}
                />
              )}
            </Card>
          </div>
        </Col>
      </Row>

      {/* Workflow Status Change Modal */}
      <Modal
        title="Update Ticket Status"
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        onOk={() => statusForm.submit()}
        confirmLoading={submittingAction}
        okText="Apply Status"
        destroyOnClose
      >
        <Form form={statusForm} layout="vertical" onFinish={handleChangeStatus} style={{ marginTop: 16 }}>
          <Form.Item
            name="status"
            label="New Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Option value="OPEN">Open (Triage & backlog)</Option>
              <Option value="IN_PROGRESS">In Progress (Active investigation)</Option>
              <Option value="PENDING">Pending (Awaiting customer or external response)</Option>
              <Option value="RESOLVED">Resolved (Solution provided)</Option>
              <Option value="CLOSED">Closed (Finalized)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Change Reason / Notes"
            rules={[{ required: true, message: 'Please provide a brief reason for the transition' }]}
          >
            <TextArea rows={3} placeholder="e.g. Solution delivered and verified with customer" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Assignment Modal */}
      <Modal
        title="Assign Support Agent"
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onOk={() => assignForm.submit()}
        confirmLoading={submittingAction}
        okText="Confirm Assignment"
        destroyOnClose
      >
        <Form form={assignForm} layout="vertical" onFinish={handleAssignTicket} style={{ marginTop: 16 }}>
          <Form.Item name="assigneeId" label="Agent / Admin">
            <Select placeholder="Select staff member (or leave empty to unassign)" allowClear>
              {eligibleAssignees.map((a) => (
                <Option key={a.id} value={a.id}>
                  {a.fullName} ({a.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal
        title="Edit Ticket Content"
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={() => editForm.submit()}
        confirmLoading={submittingAction}
        okText="Save Changes"
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleSaveEdit} style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select category' }]}
          >
            <Select>
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Duplicate Ticket Modal */}
      <Modal
        title="Duplicate / Clone Ticket"
        open={duplicateModalOpen}
        onCancel={() => setDuplicateModalOpen(false)}
        onOk={() => duplicateForm.submit()}
        confirmLoading={submittingAction}
        okText="Create Cloned Ticket"
        destroyOnClose
      >
        <Form form={duplicateForm} layout="vertical" onFinish={handleSaveDuplicate} style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Cloned Ticket Title"
            rules={[{ required: true, message: 'Please enter title' }]}
          >
            <Input />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select>
                {categories.map((c) => (
                  <Option key={c.id} value={c.id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="priority"
              label="Priority"
              rules={[{ required: true, message: 'Please select priority' }]}
            >
              <Select>
                <Option value="LOW">Low</Option>
                <Option value="MEDIUM">Medium</Option>
                <Option value="HIGH">High</Option>
                <Option value="URGENT">Urgent</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <TextArea rows={5} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};