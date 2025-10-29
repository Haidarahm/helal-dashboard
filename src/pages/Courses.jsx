import { useEffect, useState } from "react";
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
} from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import useCoursesStore from "../store/coursesStore";
import { coursesApi } from "../apis/courses";
import { toast } from "react-toastify";
import DescriptionText from "../components/DescriptionText";

const { Title, Text } = Typography;
const { TextArea } = Input;

const Courses = () => {
  const {
    courses,
    loading,
    fetchCourses,
    deleteCourse,
    addCourse,
    updateCourse,
  } = useCoursesStore();
  const [language, setLanguage] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

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

      // Always send all fields for both add and update
      formData.append("title_en", values.title_en || "");
      formData.append("title_ar", values.title_ar || "");
      formData.append("subTitle_en", values.subTitle_en || "");
      formData.append("subTitle_ar", values.subTitle_ar || "");
      formData.append("description_en", values.description_en || "");
      formData.append("description_ar", values.description_ar || "");

      // Handle numbers - convert to string
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

      // Append image file only if it exists (single image)
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      // Only check for image when adding new course
      if (!editingCourse) {
        if (fileList.length === 0 || !fileList[0].originFileObj) {
          toast.error("Please upload an image");
          return;
        }
      }

      // Debug: Log FormData entries
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`${pair[0]}:`, pair[1].name, `(${pair[1].size} bytes)`);
        } else {
          console.log(`${pair[0]}:`, pair[1]);
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
                    icon={<EditOutlined />}
                    key="edit"
                    className="text-blue-600"
                    onClick={() => handleEditCourse(item)}
                  >
                    Edit
                  </Button>,
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
                      icon={<DeleteOutlined />}
                      key="delete"
                      danger
                    >
                      Delete
                    </Button>
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

export default Courses;
