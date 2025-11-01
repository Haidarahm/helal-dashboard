import React from "react";
import { Navigate } from "react-router-dom";
import Login from "./Login";

const AuthGate = () => {
  const isAuthenticated =
    localStorage.getItem("isAuthenticated") === "true" ||
    !!localStorage.getItem("token");
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Login />;
};

export default AuthGate;
