import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/authContext";
import "./Sidebar.css";

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="sidebar">
      {/* User Profile Section */}
      <NavLink to="/admin/profile" className="sidebar-profile">
        <div className="profile-image">
          <img
            src={user?.photo ? `/img/users/${user.photo}` : "/default.jpg"}
            alt="Profile"
          />
        </div>
        <div className="profile-info">
          <h3>{user?.name || "Admin"}</h3>
          <span className="profile-role">{user?.role || "admin"}</span>
        </div>
      </NavLink>

      <h2 className="sidebar-title">⚙️ Admin Panel</h2>
      <nav className="sidebar-nav">
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
          end
        >
          📊 Dashboard
        </NavLink>

        <NavLink
          to="/admin/manage-users"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👥 Manage Users
        </NavLink>

        <NavLink
          to="/admin/manage-teachers"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👨‍🏫 Manage Teachers
        </NavLink>

        <NavLink
          to="/admin/manage-students"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👩‍🎓 Manage Students
        </NavLink>

        <NavLink
          to="/admin/manage-subjects"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👩‍🎓 Manage subjects
        </NavLink>

        <NavLink
          to="/admin/manage-classes"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📚 Manage Classes
        </NavLink>
      </nav>

      {/* Logout Button */}
      <div className="sidebar-logout">
        <button onClick={handleLogout} className="logout-btn">
          🚪 Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
