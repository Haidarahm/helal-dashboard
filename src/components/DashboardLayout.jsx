import { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from "antd";
import { toast } from "react-toastify";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  BookOutlined,
  FileTextOutlined,
  VideoCameraOutlined, // Added for live video
} from "@ant-design/icons";
import { PhoneOutlined } from "@ant-design/icons";
import { CalendarOutlined } from "@ant-design/icons";
import { FiVideo } from "react-icons/fi";
import StartMeetingModal from "./StartMeetingModal";
import useAuthStore from "../store/authStore";
import { useAuthContext } from "../context/AuthContext";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [meetOpen, setMeetOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();
  const { clearToken } = useAuthContext();

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
      key: "/dashboard/news",
      icon: <FileTextOutlined />,
      label: "News",
      onClick: () => navigate("/dashboard/news"),
    },
    {
      key: "/dashboard/live-video",
      icon: <VideoCameraOutlined />, // New menu item for Live Video
      label: "Live Video",
      onClick: () => navigate("/dashboard/live-video"),
    },
    {
      key: "/dashboard/meetings",
      icon: <CalendarOutlined />,
      label: "Meetings",
      onClick: () => navigate("/dashboard/meetings"),
    },
    {
      key: "/dashboard/consultations",
      icon: <PhoneOutlined />,
      label: "Consultations",
      onClick: () => navigate("/dashboard/consultations"),
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
      onClick: async () => {
        await logout(clearToken);
        toast.success("Logged out successfully");
        navigate("/", { replace: true });
      },
    },
  ];

  // Get current selected key based on location
  const selectedKey = location.pathname;

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Header
        style={{
          background: "#ffffff",
          padding: "0 24px",
          height: "64px",
          lineHeight: "64px",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
        className="flex items-center justify-between sticky top-0 z-50"
      >
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <Title
            level={4}
            className="!mb-0 text-gray-800 font-semibold !text-lg"
          >
            Dashboard
          </Title>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="text"
            icon={<FiVideo />}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setMeetOpen(true)}
          />
          <Button
            type="text"
            icon={<BellOutlined />}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              size={40}
              icon={<UserOutlined />}
              className="cursor-pointer hover:ring-2 ring-blue-500 transition-all bg-gradient-to-br from-blue-500 to-indigo-600"
              style={{ cursor: "pointer" }}
            />
          </Dropdown>
        </div>
      </Header>
      <StartMeetingModal open={meetOpen} onClose={() => setMeetOpen(false)} />

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
          style={{
            position: "fixed",
            right: 0,
            top: 64,
            bottom: 0,
            overflow: "auto",
            background: "#ffffff",
            boxShadow: "-2px 0 8px rgba(0, 0, 0, 0.1)",
            borderLeft: "1px solid #e5e7eb",
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{
              borderRight: 0,
              paddingTop: "16px",
              height: "100%",
            }}
          />
        </Sider>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
