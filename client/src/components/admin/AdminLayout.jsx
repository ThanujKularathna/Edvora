import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./AdminLayout.css";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="admin-content flex-1 p-6 bg-gray-100 overflow-y-auto">
        <Outlet /> 
      </div>
    </div>
  );
};

export default AdminLayout;
