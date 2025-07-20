import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(
    function () {
      if (!isLoading && !isAuthenticated) navigate("/");
    },
    [isAuthenticated, isLoading, navigate]
  );

  if (isLoading) return null;
  return isAuthenticated ? children : null;
}

export default ProtectedRoute;
