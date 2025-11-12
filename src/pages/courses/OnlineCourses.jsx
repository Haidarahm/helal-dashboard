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
  DatePicker,
  TimePicker,
  Image,
  Popconfirm,
  Row,
  Col,
  InputNumber,
  message,
} from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";
import useOnlineCoursesStore from "../../store/onlineCoursesStore";

const { Title, Text } = Typography;
const { TextArea } = Input;

const OnlineCourses = () => {
  const {
    onlineCourses,
    pagination,
    loading,
    fetchOnlineCourses,
    createOnlineCourse,
    updateOnlineCourse,
    deleteOnlineCourse,
  } = useOnlineCoursesStore();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [lang, setLang] = useState("ar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchOnlineCourses({ lang, page, per_page: perPage });
  }, [lang, page, perPage]);

  const dataSource = useMemo(
    () => (onlineCourses || []).map((c) => ({ key: c.id, ...c })),
    [onlineCourses]
  );

  const handleAddCourse = () => {
    setEditingCourse(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEditCourse = (item) => {
    setEditingCourse(item);
    const ap = item.appointment || {};
    form.setFieldsValue({
      name_en: item.name_en || "",
      name_ar: item.name_ar || "",
      description_en: item.description_en || "",
      description_ar: item.description_ar || "",
      price_aed: item.price_aed ? parseFloat(item.price_aed) : undefined,
      price_usd: item.price_usd ? parseFloat(item.price_usd) : undefined,
      date: ap.date ? dayjs(ap.date) : undefined,
      start_time: ap.start_time
        ? dayjs(ap.start_time, ["HH:mm", "HH:mm:ss"])
        : undefined,
      end_time: ap.end_time
        ? dayjs(ap.end_time, ["HH:mm", "HH:mm:ss"])
        : undefined,
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteOnlineCourse(id);
    if (result.success) {
      // List will be refreshed automatically
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async () => {
    try {
      // Validate cover image first - only required for new course
      // Check if file exists and has either originFileObj or file property
      const hasValidFile =
        fileList.length > 0 && (fileList[0].originFileObj || fileList[0].file);
      if (!editingCourse && !hasValidFile) {
        // Show error message
        message.error("Please upload a cover image");
        return;
      }

      // Validate other fields (excluding cover_image since Upload doesn't set form value)
      const values = await form.validateFields([
        "name_en",
        "name_ar",
        "description_en",
        "description_ar",
        "price_aed",
        "price_usd",
        "date",
        "start_time",
        "end_time",
      ]);

      const payload = {
        name_en: values.name_en,
        name_ar: values.name_ar,
        description_en: values.description_en,
        description_ar: values.description_ar,
        price_aed: values.price_aed?.toString(),
        price_usd: values.price_usd?.toString(),
        date: values.date ? values.date.format("DD-MM-YYYY") : undefined,
        start_time: values.start_time
          ? values.start_time.format("HH:mm")
          : undefined,
        end_time: values.end_time ? values.end_time.format("HH:mm") : undefined,
        cover_image:
          fileList.length > 0 && (fileList[0].originFileObj || fileList[0].file)
            ? fileList[0].originFileObj || fileList[0].file
            : undefined,
      };

      // For update, only send fields that have values
      if (editingCourse) {
        const updatePayload = {};

        // Helper function to check if a value exists (not undefined, null, or empty string)
        const hasValue = (val) => {
          if (val === undefined || val === null) return false;
          if (typeof val === "string" && val.trim() === "") return false;
          return true;
        };

        if (hasValue(payload.name_en)) updatePayload.name_en = payload.name_en;
        if (hasValue(payload.name_ar)) updatePayload.name_ar = payload.name_ar;
        if (hasValue(payload.description_en))
          updatePayload.description_en = payload.description_en;
        if (hasValue(payload.description_ar))
          updatePayload.description_ar = payload.description_ar;
        if (hasValue(payload.price_aed))
          updatePayload.price_aed = payload.price_aed;
        if (hasValue(payload.price_usd))
          updatePayload.price_usd = payload.price_usd;
        if (hasValue(payload.date)) updatePayload.date = payload.date;
        if (hasValue(payload.start_time))
          updatePayload.start_time = payload.start_time;
        if (hasValue(payload.end_time))
          updatePayload.end_time = payload.end_time;
        if (payload.cover_image)
          updatePayload.cover_image = payload.cover_image;

        const result = await updateOnlineCourse(
          editingCourse.id,
          updatePayload
        );
        if (result.success) {
          handleCancel();
        }
      } else {
        const result = await createOnlineCourse(payload);
        if (result.success) {
          handleCancel();
        }
      }
    } catch (error) {
      console.error("Form validation failed:", error);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = () => {
    return false; // Prevent auto upload
  };

  const columns = [
    { title: "#", key: "order", width: 70, render: (_t, _r, i) => i + 1 },
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
    },
    {
      title: "Price (AED)",
      dataIndex: "price_aed",
      key: "price_aed",
      width: 120,
    },
    {
      title: "Price (USD)",
      dataIndex: "price_usd",
      key: "price_usd",
      width: 120,
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
      title: "Meet URL",
      dataIndex: "meet_url",
      key: "meet_url",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        ) : (
          "-"
        ),
    },
    {
      title: "Appointment",
      key: "appointment",
      render: (_, row) => {
        const ap = row.appointment || {};
        if (!ap || (!ap.date && !ap.start_time)) return "-";

        const date = ap.date ? new Date(ap.date).toLocaleDateString() : "";
        const trimSeconds = (t) =>
          typeof t === "string" ? t.split(":").slice(0, 2).join(":") : "";
        const timeRange =
          ap.start_time && ap.end_time
            ? `${trimSeconds(ap.start_time)} - ${trimSeconds(ap.end_time)}`
            : trimSeconds(ap.start_time);

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {date && <Text>{date}</Text>}
            {timeRange && <Text type="secondary">{timeRange}</Text>}
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="text"
            icon={<FiEdit2 />}
            className="text-blue-600"
            onClick={() => handleEditCourse(record)}
          />
          <Popconfirm
            title="Delete Online Course"
            description="Are you sure you want to delete this course?"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <Title level={2} className="!mb-0">
            Online Courses
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
              onClick={handleAddCourse}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
            >
              Add Course
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : dataSource.length === 0 ? (
          <Empty description="No online courses found" />
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
        title={editingCourse ? "Edit Online Course" : "Add Online Course"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingCourse ? "Update" : "Add"}
        width={800}
        okButtonProps={{ loading: loading }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name (English)"
                name="name_en"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please enter English name" }]
                }
              >
                <Input placeholder="Enter name in English" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Name (Arabic)"
                name="name_ar"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please enter Arabic name" }]
                }
              >
                <Input placeholder="أدخل الاسم بالعربية" dir="rtl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Description (English)"
                name="description_en"
                rules={
                  editingCourse
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please enter English description",
                        },
                      ]
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
                  editingCourse
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please enter Arabic description",
                        },
                      ]
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Price (AED)"
                name="price_aed"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please enter price in AED" }]
                }
              >
                <InputNumber
                  placeholder="Enter price in AED"
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `AED ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/AED\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Price (USD)"
                name="price_usd"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please enter price in USD" }]
                }
              >
                <InputNumber
                  placeholder="Enter price in USD"
                  min={0}
                  step={0.01}
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `USD ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/USD\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Date"
                name="date"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please select a date" }]
                }
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD-MM-YYYY"
                  placeholder="Select date"
                  getPopupContainer={(trigger) => trigger.parentElement}
                  placement="topLeft"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Start Time"
                name="start_time"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please select start time" }]
                }
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="Select start time"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="End Time"
                name="end_time"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please select end time" }]
                }
              >
                <TimePicker
                  style={{ width: "100%" }}
                  format="HH:mm"
                  placeholder="Select end time"
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
              {!editingCourse && (
                <span className="text-red-500 ml-1">
                  (Required for new course)
                </span>
              )}
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OnlineCourses;
