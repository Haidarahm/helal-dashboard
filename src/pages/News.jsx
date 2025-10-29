import { useEffect, useState } from "react";
import { Typography, Card, Button, Pagination, Image, Empty, Spin } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import useNewsStore from "../store/newsStore";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const News = () => {
  const { news, loading, pagination, fetchNews, deleteNews } = useNewsStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    fetchNews(language, currentPage, 10);
  }, [currentPage, language]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this news?")) {
      const result = await deleteNews(id);
      if (result.success) {
        // News list will be refreshed automatically
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
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
                    >
                      Edit
                    </Button>,
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      key="delete"
                      danger
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileTextOutlined className="text-blue-500 text-xl" />
                      <Title
                        level={4}
                        className="!mb-0 text-gray-900 line-clamp-2"
                      >
                        {item.title}
                      </Title>
                    </div>

                    {item.subtitle && (
                      <Text className="text-gray-600 text-sm block mb-2">
                        {item.subtitle}
                      </Text>
                    )}

                    <Text className="text-gray-500 text-sm block mb-3 line-clamp-3">
                      {item.description}
                    </Text>

                    {item.images && item.images.length > 0 && (
                      <div className="mb-3">
                        <Image.PreviewGroup>
                          <div className="flex gap-2 flex-wrap">
                            {item.images.slice(0, 3).map((img, idx) => (
                              <Image
                                key={idx}
                                src={img}
                                alt={`News ${item.id} image ${idx + 1}`}
                                width={80}
                                height={80}
                                className="object-cover rounded"
                                preview={{
                                  mask:
                                    "+" +
                                    (item.images.length > 3
                                      ? item.images.length - 3
                                      : 0),
                                }}
                              />
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

                    <div className="flex items-center justify-between">
                      <Text className="text-gray-400 text-xs">
                        ID: {item.id}
                      </Text>
                      <Text className="text-gray-400 text-xs">
                        {item.images?.length || 0} image
                        {item.images?.length !== 1 ? "s" : ""}
                      </Text>
                    </div>
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
    </div>
  );
};

export default News;
