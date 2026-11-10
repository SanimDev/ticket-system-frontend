import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
} from 'antd';
import {
  FileAddOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { ticketsApi } from '../../api/tickets';
import { categoriesApi } from '../../api/categories';
import type { Category, TicketPriority } from '../../types';
import type { Dayjs } from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  title: string;
  categoryId: number;
  priority: TicketPriority;
  dueDate?: Dayjs;
  description: string;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm<FormValues>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const data = await categoriesApi.getCategories(true);
      setCategories(data);
    } catch {
      message.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadCategories();
      form.resetFields();
      form.setFieldsValue({
        priority: 'MEDIUM',
      });
    }
  }, [open, form, loadCategories]);

  const handleFinish = async (values: FormValues) => {
    try {
      setSubmitting(true);
      await ticketsApi.createTicket({
        title: values.title.trim(),
        description: values.description.trim(),
        categoryId: values.categoryId,
        priority: values.priority,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      });

      message.success('Ticket submitted successfully!');
      form.resetFields();
      onSuccess();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <FileAddOutlined style={{ color: '#1677ff' }} />
          <span>Create New Support Ticket</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="Create Ticket"
      cancelText="Cancel"
      width={640}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="title"
          label="Ticket Title"
          rules={[
            { required: true, message: 'Please enter a ticket title' },
            { min: 5, message: 'Title must be at least 5 characters long' },
          ]}
        >
          <Input placeholder="e.g. Cannot access invoice billing portal" maxLength={150} showCount />
        </Form.Item>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Form.Item
            name="categoryId"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select
              placeholder="Select category"
              loading={loadingCategories}
              showSearch
              filterOption={(input, option) =>
                String(option?.children ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
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
            rules={[{ required: true, message: 'Please select a priority' }]}
          >
            <Select placeholder="Select priority">
              <Option value="LOW">Low</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HIGH">High</Option>
              <Option value="URGENT">
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span>Urgent</span>
                </Space>
              </Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="dueDate" label="Target Due Date (Optional)">
          <DatePicker
            style={{ width: '100%' }}
            placeholder="Select expected resolution date"
            showTime={{ format: 'HH:mm' }}
            format="YYYY-MM-DD HH:mm"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Detailed Description"
          rules={[
            { required: true, message: 'Please provide full details of the issue' },
            { min: 10, message: 'Description must be at least 10 characters long' },
          ]}
        >
          <TextArea
            rows={5}
            placeholder="Describe the problem, steps to reproduce, expected behavior, and error messages encountered..."
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
