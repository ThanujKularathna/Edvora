import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudentDashboard from "./pages/StudentDashboard";
import SubjectPage from "./pages/SubjectPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassToolPage from "./pages/ClassToolPage";
import { AuthProvider } from "./contexts/authContext";
import ProtectedRoute from "./pages/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/subject/:subjectName" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
          <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/class/:className" element={<ProtectedRoute><ClassToolPage /></ProtectedRoute>} />
          <Route path="/class-tool-page" element={<ProtectedRoute><ClassToolPage /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
