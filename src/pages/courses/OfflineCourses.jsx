import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  Button,
  Image,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Upload,
  Popconfirm,
  Row,
  Col,
  InputNumber,
  Table,
  Select,
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { FiUsers, FiVideo, FiEdit2, FiTrash2 } from "react-icons/fi";
import useCoursesStore from "../../store/coursesStore";
import useMeetingsStore from "../../store/meetingsStore";
import { toast } from "react-toastify";
import DescriptionText from "../../components/DescriptionText";

const { Title, Text } = Typography;
const { TextArea } = Input;

const OfflineCourses = () => {
  const navigate = useNavigate();
  const {
    courses,
    loading,
    fetchCourses,
    deleteCourse,
    addCourse,
    updateCourse,
    // users
    courseUsers,
    courseUsersPagination,
    fetchCourseUsers,
    courseUsersLoading,
  } = useCoursesStore();
  const { meetings, fetchMeetings, sendUsersEmailRoom, sending } =
    useMeetingsStore();
  const [language, setLanguage] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  // Users modal state
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [usersCourseId, setUsersCourseId] = useState(null);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(5);
  const [usersSelectedRowKeys, setUsersSelectedRowKeys] = useState([]);
  const [meetingId, setMeetingId] = useState(null);
  const [showMeetingSelect, setShowMeetingSelect] = useState(false);
  const [meetingsBtnLoading, setMeetingsBtnLoading] = useState(false);

  useEffect(() => {
    fetchCourses(language);
  }, [language]);

  const handleAddCourse = () => {
    setEditingCourse(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEditCourse = (item) => {
    setEditingCourse(item);
    form.setFieldsValue({
      title_en: item.title_en || "",
      title_ar: item.title_ar || "",
      subTitle_en: item.subTitle || item.subTitle_en || "",
      subTitle_ar: item.subTitle_ar || "",
      description_en: item.description || item.description_en || "",
      description_ar: item.description_ar || "",
      price_aed: item.price_aed ? parseFloat(item.price_aed) : undefined,
      price_usd: item.price_usd ? parseFloat(item.price_usd) : undefined,
      reviews:
        item.reviews !== null && item.reviews !== undefined ? item.reviews : 0,
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteCourse(id);
    if (result.success) {
      // Courses list will be refreshed automatically
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
      // Validate form fields
      const values = await form.validateFields();

      // Validate image - only required for new course, not for updates
      if (!editingCourse && fileList.length === 0) {
        toast.error("Please upload an image");
        return;
      }

      const formData = new FormData();

      const appendIfPresent = (key, val) => {
        if (val === undefined || val === null) return;
        if (typeof val === "string" && val.trim() === "") return;
        formData.append(key, val);
      };

      if (editingCourse) {
        // Update: only append non-empty fields
        appendIfPresent("title_en", values.title_en);
        appendIfPresent("title_ar", values.title_ar);
        appendIfPresent("subTitle_en", values.subTitle_en);
        appendIfPresent("subTitle_ar", values.subTitle_ar);
        appendIfPresent("description_en", values.description_en);
        appendIfPresent("description_ar", values.description_ar);
        if (values.price_aed !== undefined && values.price_aed !== null) {
          appendIfPresent("price_aed", values.price_aed.toString());
        }
        if (values.price_usd !== undefined && values.price_usd !== null) {
          appendIfPresent("price_usd", values.price_usd.toString());
        }
        if (values.reviews !== undefined && values.reviews !== null) {
          appendIfPresent("reviews", values.reviews.toString());
        }
        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append("image", fileList[0].originFileObj);
        }
      } else {
        // Create: send all fields (as before)
        formData.append("title_en", values.title_en || "");
        formData.append("title_ar", values.title_ar || "");
        formData.append("subTitle_en", values.subTitle_en || "");
        formData.append("subTitle_ar", values.subTitle_ar || "");
        formData.append("description_en", values.description_en || "");
        formData.append("description_ar", values.description_ar || "");
        formData.append(
          "price_aed",
          values.price_aed !== undefined && values.price_aed !== null
            ? values.price_aed.toString()
            : "0.00"
        );
        formData.append(
          "price_usd",
          values.price_usd !== undefined && values.price_usd !== null
            ? values.price_usd.toString()
            : "0.00"
        );
        formData.append(
          "reviews",
          values.reviews !== undefined && values.reviews !== null
            ? values.reviews.toString()
            : "0"
        );
        // Image required for create
        if (fileList.length > 0 && fileList[0].originFileObj) {
          formData.append("image", fileList[0].originFileObj);
        }
        if (fileList.length === 0 || !fileList[0].originFileObj) {
          toast.error("Please upload an image");
          return;
        }
      }


      if (editingCourse) {
        console.log("Updating course with ID:", editingCourse.id);
        const result = await updateCourse(editingCourse.id, formData);
        if (result.success) {
          handleCancel();
        } else {
          console.error("Update failed:", result.error);
        }
      } else {
        console.log("Adding new course");
        const result = await addCourse(formData);
        if (result.success) {
          handleCancel();
        } else {
          console.error("Add failed:", result.error);
        }
      }
    } catch (error) {
      console.error("Form validation failed:", error);
      if (error.errorFields) {
        toast.error("Please fill all required fields");
      }
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Limit to single image
    setFileList(newFileList.slice(-1));
  };

  const beforeUpload = () => {
    return false; // Prevent auto upload
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Title level={2} className="!mb-2 text-gray-900">
              Courses
            </Title>
            <Text className="text-gray-500">
              Manage and view all your courses
            </Text>
          </div>
          <div className="flex items-center gap-3">
           
            <Button.Group>
              <Button
                type={language === "en" ? "primary" : "default"}
                onClick={() => setLanguage("en")}
              >
                English
              </Button>
              <Button
                type={language === "ar" ? "primary" : "default"}
                onClick={() => setLanguage("ar")}
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
        ) : courses.length === 0 ? (
          <Empty description="No courses found" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-md transition-shadow border-gray-200"
                actions={[
                  <Button
                    type="text"
                    key="users"
                    className="text-purple-600"
                    onClick={async () => {
                      setUsersCourseId(item.id);
                      setUsersPage(1);
                      setUsersPerPage(5);
                      setUsersSelectedRowKeys([]);
                      setUsersModalOpen(true);
                      fetchCourseUsers(item.id, 1, 5);
                    }}
                    icon={<FiUsers />}
                  />,
                  <Button
                    type="text"
                    key="videos"
                    className="text-green-600"
                    onClick={() =>
                      navigate(`/dashboard/courses/${item.id}/videos`)
                    }
                    icon={<FiVideo />}
                  />,
                  <Button
                    type="text"
                    icon={<FiEdit2 />}
                    key="edit"
                    className="text-blue-600"
                    onClick={() => handleEditCourse(item)}
                  />,
                  <Popconfirm
                    title="Delete Course"
                    description="Are you sure you want to delete this course?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Yes"
                    cancelText="No"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      icon={<FiTrash2 />}
                      key="delete"
                      danger
                    />
                  </Popconfirm>,
                ]}
              >
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOutlined className="text-blue-500 text-xl" />
                    <Title
                      level={4}
                      className="!mb-0 text-gray-900 line-clamp-1"
                    >
                      {item.title}
                    </Title>
                  </div>

                  {item.subTitle && (
                    <Text className="text-gray-600 text-sm block mb-2">
                      {item.subTitle}
                    </Text>
                  )}

                  <div className="mb-3">
                    <DescriptionText
                      description={item.description}
                      maxLines={2}
                    />
                  </div>

                  {item.image && (
                    <div className="mb-3">
                      <div className="relative overflow-hidden rounded cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:z-10">
                        <Image
                          src={item.image}
                          alt={`Course image`}
                          width="100%"
                          height={200}
                          className="object-cover rounded transition-transform duration-300 hover:scale-110"
                          preview={{
                            mask: false,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex flex-col gap-1">
                      {item.price_aed && (
                        <Text className="text-gray-700 text-sm font-medium">
                          AED {parseFloat(item.price_aed).toFixed(2)}
                        </Text>
                      )}
                      {item.price_usd && (
                        <Text className="text-gray-500 text-xs">
                          USD {parseFloat(item.price_usd).toFixed(2)}
                        </Text>
                      )}
                    </div>
                    {item.reviews !== null && item.reviews !== undefined && (
                      <Text className="text-gray-600 text-sm">
                        {item.reviews} review{item.reviews !== 1 ? "s" : ""}
                      </Text>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        title="Course Users"
        open={usersModalOpen}
        onCancel={() => setUsersModalOpen(false)}
        footer={null}
        width={720}
        destroyOnClose
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <div>
            {showMeetingSelect && (
              <Select
                style={{ minWidth: 260 }}
                placeholder="Select a meeting"
                value={meetingId}
                onChange={(val) => setMeetingId(val)}
                options={(meetings || []).map((m) => ({
                  label: `${m.summary} — ${m.start_time}`,
                  value: m.id,
                }))}
              />
            )}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              loading={meetingsBtnLoading}
              disabled={meetingsBtnLoading}
              onClick={async () => {
                setMeetingsBtnLoading(true);
                try {
                  await fetchMeetings();
                  setShowMeetingSelect(true);
                } finally {
                  setMeetingsBtnLoading(false);
                }
              }}
            >
              Check meetings
            </Button>
            <Button
              type="primary"
              disabled={
                usersSelectedRowKeys.length === 0 || !meetingId || sending
              }
              loading={sending}
              onClick={async () => {
                await sendUsersEmailRoom(meetingId, usersSelectedRowKeys);
              }}
            >
              Send room
            </Button>
          </div>
        </div>
        <Table
          loading={courseUsersLoading}
          columns={[
            {
              title: "#",
              key: "order",
              width: 70,
              render: (_t, _r, i) => i + 1,
            },
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Email", dataIndex: "email", key: "email" },
            { title: "Role", dataIndex: "role", key: "role" },
          ]}
          dataSource={(courseUsers || []).map((u) => ({ key: u.id, ...u }))}
          rowSelection={{
            selectedRowKeys: usersSelectedRowKeys,
            onChange: (keys) => setUsersSelectedRowKeys(keys),
          }}
          pagination={{
            current: courseUsersPagination?.current_page || usersPage,
            total: courseUsersPagination?.total || 0,
            pageSize: courseUsersPagination?.per_page || usersPerPage,
            showSizeChanger: true,
            onChange: async (p, ps) => {
              setUsersPage(p);
              setUsersPerPage(ps);
              if (usersCourseId) await fetchCourseUsers(usersCourseId, p, ps);
            },
          }}
          bordered
        />
      </Modal>

      <Modal
        title={editingCourse ? "Edit Course" : "Add Course"}
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
                label="Title (English)"
                name="title_en"
                rules={
                  editingCourse
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please enter English title",
                        },
                      ]
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
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please enter Arabic title" }]
                }
              >
                <Input placeholder="أدخل العنوان بالعربية" dir="rtl" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Subtitle (English)"
                name="subTitle_en"
                rules={
                  editingCourse
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please enter English subtitle",
                        },
                      ]
                }
              >
                <Input placeholder="Enter subtitle in English" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Subtitle (Arabic)"
                name="subTitle_ar"
                rules={
                  editingCourse
                    ? []
                    : [
                        {
                          required: true,
                          message: "Please enter Arabic subtitle",
                        },
                      ]
                }
              >
                <Input placeholder="أدخل العنوان الفرعي بالعربية" dir="rtl" />
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
                    : [
                        {
                          required: true,
                          message: "Please enter price in AED",
                        },
                      ]
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
                    : [
                        {
                          required: true,
                          message: "Please enter price in USD",
                        },
                      ]
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
                label="Reviews"
                name="reviews"
                rules={
                  editingCourse
                    ? []
                    : [{ required: true, message: "Please enter reviews" }]
                }
              >
                <InputNumber
                  placeholder="Enter number of reviews"
                  min={0}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Image">
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

export default OfflineCourses;
