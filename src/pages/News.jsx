import { useEffect, useState, useRef } from "react";
import {
  Typography,
  Card,
  Button,
  Pagination,
  Image,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  Upload,
  Popconfirm,
  Popover,
  Row,
  Col,
} from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import useNewsStore from "../store/newsStore";
import { toast } from "react-toastify";
import DescriptionText from "../components/DescriptionText";

const { Title, Text } = Typography;
const { TextArea } = Input;

const News = () => {
  const {
    news,
    loading,
    pagination,
    fetchNews,
    deleteNews,
    addNews,
    updateNews,
  } = useNewsStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchNews(language, currentPage, 5);
  }, [currentPage, language]);

  const handleAddNews = () => {
    setEditingNews(null);
    form.resetFields();
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleEditNews = (item) => {
    setEditingNews(item);
    form.setFieldsValue({
      title_en: item.title_en || "",
      title_ar: item.title_ar || "",
      subtitle_en: item.subtitle_en || "",
      subtitle_ar: item.subtitle_ar || "",
      description_en: item.description_en || "",
      description_ar: item.description_ar || "",
    });
    setFileList([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await deleteNews(id);
    if (result.success) {
      // News list will be refreshed automatically
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingNews(null);
    form.resetFields();
    setFileList([]);
  };

  const handleSubmit = async () => {
    try {
      // Validate form fields
      const values = await form.validateFields();

      const formData = new FormData();

      const appendIfPresent = (key, val) => {
        if (val === undefined || val === null) return;
        if (typeof val === "string" && val.trim() === "") return;
        formData.append(key, val);
      };

      // On create, all fields from values are appended (they passed required checks)
      // On update, only non-empty fields are appended
      appendIfPresent("title_en", values.title_en);
      appendIfPresent("title_ar", values.title_ar);
      appendIfPresent("subtitle_en", values.subtitle_en);
      appendIfPresent("subtitle_ar", values.subtitle_ar);
      appendIfPresent("description_en", values.description_en);
      appendIfPresent("description_ar", values.description_ar);

      // Images: only append if provided
      if (fileList.length > 0) {
        fileList.forEach((file) => {
          let fileToAppend = null;
          if (file.originFileObj) fileToAppend = file.originFileObj;
          else if (file instanceof File) fileToAppend = file;
          if (fileToAppend instanceof File)
            formData.append("image[]", fileToAppend);
        });
      }

      // For create: at least one image required
      if (!editingNews) {
        const hasImage = Array.from(formData.keys()).some(
          (k) => k === "image[]"
        );
        if (!hasImage) {
          toast.error("Please upload at least one image");
          return;
        }
      }

      if (editingNews) {
        const result = await updateNews(editingNews.id, formData);
        if (result.success) {
          handleCancel();
        }
      } else {
        const result = await addNews(formData);
        if (result.success) {
          handleCancel();
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
    // Update fileList state
    setFileList(newFileList);
    console.log("File list updated:", newFileList);
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
              News
            </Title>
            <Text className="text-gray-500">
              Manage and view all your news articles
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
              onClick={handleAddNews}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
            >
              Add News
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : news.length === 0 ? (
          <Empty description="No news found" />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {news.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow border-gray-200"
                  actions={[
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      key="edit"
                      className="text-blue-600"
                      onClick={() => handleEditNews(item)}
                    >
                      Edit
                    </Button>,
                    <Popconfirm
                      title="Delete News"
                      description="Are you sure you want to delete this news item?"
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
                      <FileTextOutlined className="text-blue-500 text-xl" />
                      <Title
                        level={4}
                        className="!mb-0 text-gray-900 line-clamp-1"
                      >
                        {item.title}
                      </Title>
                    </div>

                    {item.subtitle && (
                      <Text className="text-gray-600 text-sm block mb-2">
                        {item.subtitle}
                      </Text>
                    )}

                    <div className="mb-3">
                      <DescriptionText
                        description={item.description}
                        maxLines={2}
                      />
                    </div>

                    {item.images && item.images.length > 0 && (
                      <div className="mb-3">
                        <Image.PreviewGroup>
                          <div className="flex gap-2 flex-wrap">
                            {item.images.slice(0, 3).map((img, idx) => (
                              <div
                                key={idx}
                                className="relative overflow-hidden rounded cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-lg hover:z-10"
                                style={{
                                  width: "80px",
                                  height: "80px",
                                }}
                              >
                                <Image
                                  src={img}
                                  alt={`News image ${idx + 1}`}
                                  width={80}
                                  height={80}
                                  className="object-cover rounded transition-transform duration-300 hover:scale-110"
                                  preview={{
                                    mask: false,
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </Image.PreviewGroup>
                        {item.images.length > 3 && (
                          <Text className="text-gray-400 text-xs">
                            +{item.images.length - 3} more images
                          </Text>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {pagination.total > 0 && (
              <div className="flex justify-center mt-6">
                <Pagination
                  current={pagination.current_page}
                  total={pagination.total}
                  pageSize={pagination.per_page}
                  showSizeChanger={false}
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} items`
                  }
                  onChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        title={editingNews ? "Edit News" : "Add News"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingNews ? "Update" : "Add"}
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
                  editingNews
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
                  editingNews
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
                name="subtitle_en"
                rules={
                  editingNews
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
                name="subtitle_ar"
                rules={
                  editingNews
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
                  editingNews
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
                  editingNews
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

          <Form.Item label="Images">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={beforeUpload}
              multiple
              accept="image/*"
            >
              {fileList.length < 10 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            <Text className="text-gray-500 text-xs block mt-2">
              You can upload multiple images (up to 10 images)
              {!editingNews && (
                <span className="text-red-500 ml-1">
                  (Required for new news)
                </span>
              )}
            </Text>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default News;
