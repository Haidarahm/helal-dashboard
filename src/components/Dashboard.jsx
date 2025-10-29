import { useState } from "react";
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  FiGrid,
  FiUsers,
  FiSettings,
  FiBell,
  FiUser,
  FiLogOut,
} from "react-icons/fi";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <UserOutlined />,
      label: "Users",
    },
    {
      key: "3",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: () => {
        localStorage.removeItem("isAuthenticated");
        window.location.href = "/";
      },
    },
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Header className="bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          />
          <Title level={4} className="!mb-0 text-gray-800 font-semibold">
            Dashboard
          </Title>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<BellOutlined />}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              size="large"
              icon={<UserOutlined />}
              className="cursor-pointer hover:ring-2 ring-blue-500 transition-all bg-gradient-to-br from-blue-500 to-indigo-600"
            />
          </Dropdown>
        </div>
      </Header>

      <Layout>
        {/* Main Content */}
        <Content
          className="p-6 transition-all duration-300"
          style={{
            marginRight: collapsed ? 0 : 250,
          }}
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="mb-6">
              <Title level={2} className="!mb-2 text-gray-900">
                Welcome Back
              </Title>
              <Text className="text-gray-500">
                Here's what's happening today
              </Text>
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
        </Content>

        {/* Sidebar on the Right */}
        <Sider
          width={250}
          collapsed={collapsed}
          collapsedWidth={0}
          theme="light"
          className="shadow-lg border-l border-gray-200"
          style={{
            position: "fixed",
            right: 0,
            top: 64,
            bottom: 0,
            overflow: "auto",
          }}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["1"]}
            items={menuItems}
            className="h-full border-r-0 pt-4"
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
