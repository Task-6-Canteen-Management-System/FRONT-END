import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

export const AdminRoute = ({ children }) => {
  const { userType, token } = useContext(StoreContext);
  if (!token || userType !== "admin") return <Navigate to="/" replace />;
  return children;
};

export const CustomerRoute = ({ children }) => {
  const { userType, token } = useContext(StoreContext);
  if (!token || userType === "admin") return <Navigate to="/admin/dashboard" replace />;
  return children;
};
