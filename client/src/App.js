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
import ProfilePage from "./pages/ProfilePage";

// adminpart
import RequireRole from "./components/common/RequireRole";

// adminpart2
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageSubjects from "./pages/admin/ManageSubjects";
import ManageClasses from "./pages/admin/ManageClasses";
import AdminLayout from "./components/admin/AdminLayout";
import { AdminProvider } from "./contexts/adminContext";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route index element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/subject/:subjectName" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
          <Route path="/teacher-dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/teacher/class/:className" element={<ProtectedRoute><ClassToolPage /></ProtectedRoute>} />
          <Route path="/class-tool-page" element={<ProtectedRoute><ClassToolPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

          {/* admin routes */}
          {process.env.NODE_ENV === "development" ? (
            // ✅ In development: no role check (so you can enter directly via URL)
            <Route path="/admin/*" element={<AdminProvider><AdminLayout /></AdminProvider>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="teachers" element={<ManageTeachers />} />
              <Route path="subjects" element={<ManageSubjects />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="classes" element={<ManageClasses />} />
            </Route>
          ) : (
            // ✅ In production: protected by RequireRole
            <Route path="/admin/*" element={<RequireRole roles={["admin"]}><AdminProvider><AdminLayout /></AdminProvider></RequireRole>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="teachers" element={<ManageTeachers />} />
              <Route path="subjects" element={<ManageSubjects />} />
              <Route path="students" element={<ManageStudents />} />
              <Route path="classes" element={<ManageClasses />} />
            </Route>
          )}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
