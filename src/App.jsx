import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthGate from "./components/AuthGate";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import Courses from "./pages/Courses";
import News from "./pages/News";
import LiveVideo from "./pages/LiveVideo";
import CourseVideos from "./pages/CourseVideos";
import { Users } from "./pages/Users";
import Meetings from "./pages/Meetings";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "antd/dist/reset.css";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthGate />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHome />,
      },
      {
        path: "courses",
        element: <Courses />,
      },
      {
        path: "news",
        element: <News />,
      },
      {
        path: "live-video",
        element: <LiveVideo />,
      },
      {
        path: "courses/:id/videos",
        element: <CourseVideos />,
      },
      {
        path: "users",
        element: <Users />,
      },
      {
        path: "meetings",
        element: <Meetings />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;
