import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true" || !!token;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
