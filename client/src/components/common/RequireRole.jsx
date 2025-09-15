import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/authContext"; // you already have this

export default function RequireRole({ roles, children }) {
  const { user, loading } = useAuth(); 
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // not logged in → go to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!roles.includes(user.role)) {
    // logged in but wrong role → back to home
    return <Navigate to="/" replace />;
  }

  // allowed
  return <>{children}</>;
}
