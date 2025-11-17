import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Typography,
  Spin,
  Empty,
  Modal,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  message,
  Card,
  Space,
  Pagination,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DollarOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  FiEdit2,
  FiTrash2,
  FiDollarSign,
  FiClock,
  FiType,
  FiPlus,
} from "react-icons/fi";
import useConsultationTypesStore from "../store/consultationTypesStore";

const { Title, Text } = Typography;
const { TextArea } = Input;

const ConsultationTypes = () => {
  const {
    consultationTypes,
    loading,
    pagination,
    fetchConsultationTypes,
    addConsultationType,
    updateConsultationType,
    deleteConsultationType,
  } = useConsultationTypesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);

  useEffect(() => {
    fetchConsultationTypes(page, perPage);
  }, [page, perPage, fetchConsultationTypes]);

  const dataSource = useMemo(
    () =>
      (consultationTypes || []).map((type) => ({
        key: type.id,
        ...type,
      })),
    [consultationTypes]
  );

  const handleAddType = () => {
    setEditingType(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditType = (type) => {
    setEditingType(type);
    // API response may have 'type' (string) or 'type_en' and 'type_ar' separately
    // If only 'type' exists, we'll use it for type_en (we can't split it)
    form.setFieldsValue({
      type_en: type.type_en || type.type || "",
      type_ar: type.type_ar || "",
      price_usd: type.price_usd ? parseFloat(type.price_usd) : 0,
      price_aed: type.price_aed ? parseFloat(type.price_aed) : 0,
      duration: type.duration || 0,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteConsultationType(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        type_en: values.type_en,
        type_ar: values.type_ar,
        price_usd: values.price_usd,
        price_aed: values.price_aed,
        duration: values.duration,
      };

      if (editingType) {
        const result = await updateConsultationType(editingType.id, data);
        if (result.success) {
          setIsModalOpen(false);
          form.resetFields();
          setEditingType(null);
        }
      } else {
        const result = await addConsultationType(data);
        if (result.success) {
          setIsModalOpen(false);
          form.resetFields();
        }
      }
    } catch (error) {
      console.error("Form validation failed:", error);
      if (error.errorFields) {
        message.error("Please fill all required fields correctly");
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingType(null);
  };

  const columns = [
    {
      title: "#",
      key: "order",
      width: 70,
      render: (_text, _record, index) =>
        (pagination.current_page - 1) * pagination.per_page + index + 1,
    },
    {
      title: "Type (EN)",
      dataIndex: "type",
      key: "type_en",
      render: (type, record) => (
        <div className="flex items-center gap-2">
          <FiType className="text-blue-500" />
          <span className="font-medium">{record.type_en || type || "-"}</span>
        </div>
      ),
    },
    {
      title: "Type (AR)",
      dataIndex: "type_ar",
      key: "type_ar",
      render: (type_ar, record) => (
        <div className="flex items-center gap-2">
          <FiType className="text-blue-500" />
          <span className="font-medium">
            {type_ar || record.type_ar || "-"}
          </span>
        </div>
      ),
    },
    {
      title: "Price (USD)",
      dataIndex: "price_usd",
      key: "price_usd",
      render: (price) => (
        <div className="flex items-center gap-2">
          <FiDollarSign className="text-green-500" />
          <span className="font-semibold">
            {parseFloat(price || 0).toFixed(2)}
          </span>
        </div>
      ),
    },
    {
      title: "Price (AED)",
      dataIndex: "price_aed",
      key: "price_aed",
      render: (price) => (
        <div className="flex items-center gap-2">
          <FiDollarSign className="text-orange-500" />
          <span className="font-semibold">
            {parseFloat(price || 0).toFixed(2)} AED
          </span>
        </div>
      ),
    },
    {
      title: "Duration (Minutes)",
      dataIndex: "duration",
      key: "duration",
      render: (duration) => (
        <div className="flex items-center gap-2">
          <FiClock className="text-purple-500" />
          <span>{duration || 0} min</span>
        </div>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<FiEdit2 />}
            onClick={() => handleEditType(record)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          />
          <Popconfirm
            title="Delete Consultation Type"
            description="Are you sure you want to delete this consultation type?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<FiTrash2 />}
              danger
              className="hover:bg-red-50"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="!mb-0">
              Consultation Types
            </Title>
            <Text type="secondary" className="text-sm">
              Manage consultation types and their pricing
            </Text>
          </div>
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={handleAddType}
            size="large"
            className="bg-linear-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 shadow-md"
          >
            Add Consultation Type
          </Button>
        </div>

        {dataSource.length === 0 && !loading ? (
          <Empty
            description="No consultation types found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={dataSource}
              bordered
              pagination={false}
              className="mb-4"
              loading={loading}
            />
            <div className="flex justify-end">
              <Pagination
                current={pagination.current_page}
                total={pagination.total}
                pageSize={pagination.per_page}
                showSizeChanger
                showTotal={(total) => `Total ${total} items`}
                onChange={(p, ps) => {
                  setPage(p);
                  setPerPage(ps);
                }}
              />
            </div>
          </>
        )}
      </div>

      <Modal
        title={editingType ? "Edit Consultation Type" : "Add Consultation Type"}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingType ? "Update" : "Add"}
        cancelText="Cancel"
        okButtonProps={{ loading: loading }}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="type_en"
            label="Type (English)"
            rules={[
              { required: true, message: "Please enter type in English" },
            ]}
          >
            <Input
              placeholder="e.g., Technical Consultation"
              size="large"
              prefix={<FiType className="text-gray-400" />}
            />
          </Form.Item>

          <Form.Item
            name="type_ar"
            label="Type (Arabic)"
            rules={[{ required: true, message: "Please enter type in Arabic" }]}
          >
            <Input
              placeholder="e.g., استشارة تقنية"
              size="large"
              prefix={<FiType className="text-gray-400" />}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="price_usd"
              label="Price (USD)"
              rules={[
                { required: true, message: "Please enter price in USD" },
                { type: "number", min: 0, message: "Price must be positive" },
              ]}
            >
              <InputNumber
                placeholder="0.00"
                size="large"
                prefix="$"
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                formatter={(value) =>
                  ` ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              name="price_aed"
              label="Price (AED)"
              rules={[
                { required: true, message: "Please enter price in AED" },
                { type: "number", min: 0, message: "Price must be positive" },
              ]}
            >
              <InputNumber
                size="large"
                style={{ width: "100%" }}
                min={0}
                step={0.01}
                formatter={(value) =>
                  `${value} AED`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\s?AED|(,*)/g, "")}
              />
            </Form.Item>
          </div>

          <Form.Item
            name="duration"
            label="Duration (Minutes)"
            rules={[
              { required: true, message: "Please enter duration" },
              {
                type: "number",
                min: 1,
                message: "Duration must be at least 1 minute",
              },
            ]}
          >
            <InputNumber
              placeholder="60"
              size="large"
              style={{ width: "100%" }}
              min={1}
              step={1}
              prefix={<FiClock className="text-gray-400 mr-2" />}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConsultationTypes;
