import { Typography, Card, Button, Space, Tag } from "antd";
import {
  BookOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Courses = () => {
  const courses = [
    {
      id: 1,
      title: "React Fundamentals",
      instructor: "John Doe",
      students: 150,
      status: "active",
    },
    {
      id: 2,
      title: "Advanced JavaScript",
      instructor: "Jane Smith",
      students: 89,
      status: "active",
    },
    {
      id: 3,
      title: "Node.js Backend",
      instructor: "Mike Johnson",
      students: 234,
      status: "draft",
    },
  ];

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
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0"
          >
            Add Course
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card
              key={course.id}
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
                >
                  Delete
                </Button>,
              ]}
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOutlined className="text-blue-500 text-xl" />
                  <Title level={4} className="!mb-0 text-gray-900">
                    {course.title}
                  </Title>
                </div>
                <Text className="text-gray-500 text-sm block mb-2">
                  Instructor: {course.instructor}
                </Text>
                <div className="flex items-center justify-between">
                  <Text className="text-gray-600 text-sm">
                    {course.students} students
                  </Text>
                  <Tag color={course.status === "active" ? "green" : "default"}>
                    {course.status}
                  </Tag>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
