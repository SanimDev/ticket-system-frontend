import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Switch,
  message,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { categoriesApi } from '../../api/categories';
import type { Category, CategoryRequest } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CategoryRequest>();

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getCategories(false);
      setCategories(data);
    } catch {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    form.setFieldsValue({ active: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      active: category.active,
    });
    setModalOpen(true);
  };

  const handleSave = async (values: CategoryRequest) => {
    try {
      setSubmitting(true);
      if (editingCategory) {
        await categoriesApi.updateCategory(editingCategory.id, values);
        message.success('Category updated successfully');
      } else {
        await categoriesApi.createCategory(values);
        message.success('New category added successfully');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } }; message?: string };
      message.error(errObj.response?.data?.message || errObj.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Category Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space size="small">
          <AppstoreOutlined style={{ color: '#1677ff' }} />
          <Text strong>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => <Text type="secondary">{desc}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      width: 130,
      render: (active: boolean) =>
        active ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Active
          </Tag>
        ) : (
          <Tag color="default" icon={<StopOutlined />}>
            Archived
          </Tag>
        ),
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: unknown, record: Category) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleOpenEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Ticket Categories
          </Title>
          <Text type="secondary">
            Configure support classifications, routing tags, and active service areas
          </Text>
        </div>

        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchCategories} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenAdd}>
            Add Category
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Card bordered bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={categories}
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* Add / Edit Category Modal */}
      <Modal
        title={editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create Ticket Category'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={submitting}
        okText={editingCategory ? 'Update Category' : 'Create Category'}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[
              { required: true, message: 'Please input category name' },
              { min: 3, message: 'Must be at least 3 characters' },
            ]}
          >
            <Input placeholder="e.g. Infrastructure & Cloud" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input category description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Explain what tickets should be categorized under this area..."
            />
          </Form.Item>

          <Form.Item
            name="active"
            label="Active Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
