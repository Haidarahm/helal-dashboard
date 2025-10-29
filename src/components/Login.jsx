import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button } from "antd";
import { toast } from "react-toastify";
import {
  MailOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { FiLock } from "react-icons/fi";
import useAuthStore from "../store/authStore";
import { useAuthContext } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { setToken } = useAuthContext();
  const { login, loading, error } = useAuthStore();

  // Redirect to dashboard if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const onFinish = async (values) => {
    const result = await login(values.email, values.password, setToken);

    if (result.success) {
      toast.success("Welcome back!");
      navigate("/dashboard");
    } else {
      toast.error(result.error || "Invalid credentials");
    }
  };

  const handleResetPassword = () => {
    toast.info("Reset password functionality coming soon");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-4">
              <FiLock className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Welcome
            </h1>
            <p className="text-gray-500 text-sm">Sign in to continue</p>
          </div>

          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
            className="space-y-6"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Email is required" },
                { type: "email", message: "Invalid email format" },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="Email"
                className="h-12 rounded-lg"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Password is required" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="Password"
                className="h-12 rounded-lg"
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-0 font-medium text-base shadow-lg shadow-blue-500/30"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="text-center">
              <Button
                type="link"
                onClick={handleResetPassword}
                className="text-gray-500 hover:text-blue-600 p-0 h-auto text-sm"
              >
                Forgot password?
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
