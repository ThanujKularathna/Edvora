import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import ManageSubjects from './../../pages/admin/ManageSubjects';

function Sidebar() {
  return (
    <div className="sidebar">
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
          to="/admin/teachers"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👨‍🏫 Manage Teachers
        </NavLink>

        <NavLink
          to="/admin/students"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👩‍🎓 Manage Students
        </NavLink>

        <NavLink
          to="/admin/subjects"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          👩‍🎓 Manage subjects
        </NavLink>

        <NavLink
          to="/admin/classes"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📚 Manage Classes
        </NavLink>

        <NavLink
          to="/admin/grades"
          className={({ isActive }) =>
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📝 Manage Grades
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;
