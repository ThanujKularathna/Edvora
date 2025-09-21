import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/authContext";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Student & Teacher Pages
import StudentDashboard from "./pages/StudentDashboard";
import SubjectPage from "./pages/SubjectPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import ClassToolPage from "./pages/ClassToolPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./pages/ProtectedRoute";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageTeachers from "./pages/admin/ManageTeachers";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageSubjects from "./pages/admin/ManageSubjects";
import ManageClasses from "./pages/admin/ManageClasses";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route index element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />

          {/* Student Routes */}
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subject/:subjectName"
            element={
              <ProtectedRoute>
                <SubjectPage />
              </ProtectedRoute>
            }
          />

          {/* Teacher Routes */}
          <Route
            path="/teacher-dashboard"
            element={
              <ProtectedRoute>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/class/:className"
            element={
              <ProtectedRoute>
                <ClassToolPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/class-tool-page"
            element={
              <ProtectedRoute>
                <ClassToolPage />
              </ProtectedRoute>
            }
          />

          {/* Common Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="manage-users" element={<ManageUsers />} />
            <Route path="manage-teachers" element={<ManageTeachers />} />
            <Route path="manage-students" element={<ManageStudents />} />
            <Route path="manage-subjects" element={<ManageSubjects />} />
            <Route path="manage-classes" element={<ManageClasses />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
