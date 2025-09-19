import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalUsers: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      console.log(data);
      setStats(data.stats);
      setRecentActivities(data.recentActivities || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-dashboard">Loading...</div>;
  }

  const statsArray = [
    { label: "Total Students", value: stats.totalStudents, icon: "🎓" },
    { label: "Total Teachers", value: stats.totalTeachers, icon: "👨🏫" },
    { label: "Total Classes", value: stats.totalClasses, icon: "🏫" },
    { label: "Total Users", value: stats.totalUsers, icon: "👥" },
  ];

  return (
    <div className="admin-dashboard">
      <div className="stats-grid">
        {statsArray.map((stat, index) => (
          <div key={index} className="stat-card">
            <h2>
              {stat.icon} {stat.value}
            </h2>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="recent-updates">
        <div className="recent-header">
          <h3>Recent Activities</h3>
        </div>
        <table className="recent-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>User</th>
              <th>Activity</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, idx) => (
                <tr key={idx}>
                  <td>{new Date(activity.createdAt).toLocaleString()}</td>
                  <td>{activity.user}</td>
                  <td>{activity.action}</td>
                  <td>{activity.details || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No recent activities.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
