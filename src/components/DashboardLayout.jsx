import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  BookOutlined,
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/dashboard"),
    },
    {
      key: "/dashboard/courses",
      icon: <BookOutlined />,
      label: "Courses",
      onClick: () => navigate("/dashboard/courses"),
    },
    {
      key: "/dashboard/users",
      icon: <UserOutlined />,
      label: "Users",
      onClick: () => navigate("/dashboard/users"),
    },
    {
      key: "/dashboard/settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => navigate("/dashboard/settings"),
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

  // Get current selected key based on location
  const selectedKey = location.pathname;

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
          <Outlet />
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
            selectedKeys={[selectedKey]}
            items={menuItems}
            className="h-full border-r-0 pt-4"
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;

