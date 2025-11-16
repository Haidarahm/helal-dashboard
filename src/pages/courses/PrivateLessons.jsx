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
  Upload,
  Image,
  Popconfirm,
  Row,
  Col,
  Tooltip,
  message,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import usePrivateCoursesStore from "../../store/privateCoursesStore";

const { Title, Text } = Typography;
const { TextArea } = Input;

const PrivateLessons = () => {
  const {
    privateLessons,
    pagination,
    loading,
    fetchPrivateLessons,
    createPrivateLesson,
    updatePrivateLesson,
    deletePrivateLesson,
  } = usePrivateCoursesStore();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [lang, setLang] = useState("ar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchPrivateLessons({ lang, page, per_page: perPage });
  }, []);

  const dataSource = useMemo(
    () => (privateLessons || []).map((c) => ({ key: c.id, ...c })),
    [privateLessons]
  );

  const handleAdd = () => {
    setEditingLesson(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingLesson(item);
    form.setFieldsValue({
      title_en: item.title_en || item.title || "",
      title_ar: item.title_ar || "",
      description_en: item.description_en || item.description || "",
      description_ar: item.description_ar || "",
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await deletePrivateLesson(id);
    if (result.success) {
      // list refresh handled by store
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingLesson(null);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async () => {
    try {
      // For create, ensure image is provided
      const hasFile =
        fileList.length > 0 && (fileList[0].originFileObj || fileList[0].file);
      if (!editingLesson && !hasFile) {
        message.error("Please upload a cover image");
        return;
      }

      const values = await form.validateFields();
      const payload = {
        title_en: values.title_en,
        title_ar: values.title_ar,
        description_en: values.description_en,
        description_ar: values.description_ar,
        cover_image:
          fileList.length > 0 && (fileList[0].originFileObj || fileList[0].file)
            ? fileList[0].originFileObj || fileList[0].file
            : undefined,
      };

      if (editingLesson) {
        // send only present fields
        const updatePayload = {};
        const hasValue = (val) => {
          if (val === undefined || val === null) return false;
          if (typeof val === "string" && val.trim() === "") return false;
          return true;
        };
        if (hasValue(payload.title_en))
          updatePayload.title_en = payload.title_en;
        if (hasValue(payload.title_ar))
          updatePayload.title_ar = payload.title_ar;
        if (hasValue(payload.description_en))
          updatePayload.description_en = payload.description_en;
        if (hasValue(payload.description_ar))
          updatePayload.description_ar = payload.description_ar;
        if (payload.cover_image)
          updatePayload.cover_image = payload.cover_image;

        const result = await updatePrivateLesson(
          editingLesson.id,
          updatePayload
        );
        if (result.success) {
          handleCancel();
        }
      } else {
        const result = await createPrivateLesson(payload);
        if (result.success) {
          handleCancel();
        }
      }
    } catch (e) {
      // validation errors already surfaced by antd
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = () => {
    return false; // prevent auto upload
  };

  const columns = [
    { title: "#", key: "order", width: 70, render: (_t, _r, i) => i + 1 },
    {
      title: "Title",
      key: "title",
      render: (_, row) => row.title || row.title_en || "-",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (v, row) => v || row.description_en || "-",
    },
    {
      title: "Cover",
      dataIndex: "cover_image",
      key: "cover_image",
      width: 120,
      render: (src) =>
        src ? (
          <Image
            src={src}
            width={80}
            height={50}
            style={{ objectFit: "cover" }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Action",
      key: "action",
      width: 160,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<FiEdit2 />}
              className="text-blue-600"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Delete Private Lesson"
            description="Are you sure you want to delete this lesson?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<FiTrash2 />} danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {console.log(privateLessons)}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={2} className="!mb-0">
            Private Lessons
          </Title>
          <div className="flex items-center gap-3">
      
            <Button.Group>
              <Button
                type={lang === "en" ? "primary" : "default"}
                onClick={() => {
                  setLang("en");
                  setPage(1);
                }}
              >
                English
              </Button>
              <Button
                type={lang === "ar" ? "primary" : "default"}
                onClick={() => {
                  setLang("ar");
                  setPage(1);
                }}
              >
                عربي
              </Button>
            </Button.Group>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
            >
              Add Lesson
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="No private lessons found" />
        ) : (
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={{
              current: pagination?.current_page || page,
              total: pagination?.total || dataSource.length,
              pageSize: pagination?.per_page || perPage,
              showSizeChanger: true,
              onChange: (p, ps) => {
                setPage(p);
                setPerPage(ps);
              },
            }}
            bordered
          />
        )}
      </div>

      <Modal
        title={editingLesson ? "Edit Private Lesson" : "Add Private Lesson"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingLesson ? "Update" : "Add"}
        width={800}
        okButtonProps={{ loading: loading }}
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Title (English)"
                name="title_en"
                rules={
                  editingLesson ? [] : [{ required: true, message: "Required" }]
                }
              >
                <Input placeholder="Enter title in English" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Title (Arabic)"
                name="title_ar"
                rules={
                  editingLesson ? [] : [{ required: true, message: "Required" }]
                }
              >
                <Input placeholder="أدخل العنوان بالعربية" dir="rtl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Description (English)"
                name="description_en"
                rules={
                  editingLesson ? [] : [{ required: true, message: "Required" }]
                }
              >
                <TextArea rows={4} placeholder="Enter description in English" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Description (Arabic)"
                name="description_ar"
                rules={
                  editingLesson ? [] : [{ required: true, message: "Required" }]
                }
              >
                <TextArea
                  rows={4}
                  placeholder="أدخل الوصف بالعربية"
                  dir="rtl"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Cover Image">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              accept="image/*"
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Text className="text-gray-500 text-xs block mt-2">
              You can upload one image
              {!editingLesson && (
                <span className="text-red-500 ml-1">
                  (Required for new lesson)
                </span>
              )}
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PrivateLessons;
