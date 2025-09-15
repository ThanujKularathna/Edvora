import React from "react";
import "./AdminDashboard.css";
import { useAdmin } from "../../contexts/adminContext";

function AdminDashboard() {
  // ✅ Get data from AdminContext
  const { users = [], classes = [], logs = [] } = useAdmin();

  // Count users by role
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalTeachers = users.filter((u) => u.role === "teacher").length;

  const stats = [
    { label: "Total Students", value: totalStudents, icon: "🎓" },
    { label: "Total Teachers", value: totalTeachers, icon: "👨‍🏫" },
    { label: "Total Classes", value: classes.length, icon: "🏫" },
    { label: "Total Users", value: users.length, icon: "👥" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Stats Section */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <h2>
              {stat.icon} {stat.value}
            </h2>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Updates Section */}
      <div className="recent-updates">
        <div className="recent-header">
          <h3>Recent Updates</h3>
          <a href="#">View All</a>
        </div>

        <table className="recent-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Activity Description</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map((act, idx) => (
                <tr key={idx}>
                  <td>{act.time}</td>
                  <td>{act.user}</td>
                  <td>{act.action}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No recent updates.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button>+ Add New Student</button>
        <button>+ Add New Teacher</button>
        <button>+ Create New Class</button>
        <button>📅 Class Timetable</button>
      </div>
    </div>
  );
}

export default AdminDashboard;
