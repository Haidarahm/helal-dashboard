import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import AuthGate from "./components/AuthGate";
import DashboardLayout from "./components/DashboardLayout";
import Courses from "./pages/courses/Courses";
import OnlineCourses from "./pages/courses/OnlineCourses";
import News from "./pages/News";
import LiveVideo from "./pages/LiveVideo";
import CourseVideos from "./pages/CourseVideos";
import { Users } from "./pages/Users";
import { Consultations } from "./pages/Consultations";
import ConsultationTypes from "./pages/ConsultationTypes";
import Meetings from "./pages/Meetings";
import Availability from "./pages/Availability";
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
        path: "courses",
        element: <Courses />,
      },
      {
        path: "online-courses",
        element: <OnlineCourses />,
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
        path: "consultations",
        element: <Consultations />,
      },
      {
        path: "consultation-types",
        element: <ConsultationTypes />,
      },
      {
        path: "meetings",
        element: <Meetings />,
      },
      {
        path: "availability",
        element: <Availability />,
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
