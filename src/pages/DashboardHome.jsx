import { Typography } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const DashboardHome = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <div className="mb-6">
        <Title level={2} className="!mb-2 text-gray-900">
          Welcome Back
        </Title>
        <Text className="text-gray-500">Here's what's happening today</Text>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm">Total Users</Text>
            <UserOutlined className="text-blue-500" />
          </div>
          <Title level={3} className="!mb-0 text-gray-900">
            1,234
          </Title>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm">Active Sessions</Text>
            <DashboardOutlined className="text-green-500" />
          </div>
          <Title level={3} className="!mb-0 text-gray-900">
            856
          </Title>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <Text className="text-gray-600 text-sm">Revenue</Text>
            <SettingOutlined className="text-purple-500" />
          </div>
          <Title level={3} className="!mb-0 text-gray-900">
            $12.4k
          </Title>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

