import React, { useState, useEffect, useCallback } from "react";
import "./ManageUsers.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const roles = ["admin", "teacher", "student"];

  const fetchUsers = useCallback(async (page = 1, searchTerm = '', role = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(role && { role })
      });
      
      const response = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data.users);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalUsers: data.totalUsers,
          limit: pagination.limit
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchUsers(1, search, roleFilter);
  }, [search, roleFilter]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phoneNumber: "",
    city: "",
  });

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle create user with validation
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("❌ Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          passwordConfirm: formData.confirmPassword,
          role: formData.role,
          phoneNumber: formData.phoneNumber,
          city: formData.city
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "", phoneNumber: "", city: "" });
        alert("✅ User created successfully!");
        // Refresh current page
        fetchUsers(pagination.currentPage, search, roleFilter);
      } else {
        alert("❌ Failed to create user: " + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert("❌ Error creating user");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.status === 204) {
        alert("✅ User deleted successfully!");
        // Refresh current page
        fetchUsers(pagination.currentPage, search, roleFilter);
      } else {
        alert("❌ Failed to delete user");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert("❌ Error deleting user");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, search, roleFilter);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  if (loading && users.length === 0) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="manage-users">
      {/* Create User */}
      <div className="card">
        <h2>➕ Create User</h2>
        <form onSubmit={handleCreateUser} className="form-grid">
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
          <input type="tel" name="phoneNumber" placeholder="Phone Number" value={formData.phoneNumber} onChange={handleChange} />
          <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} />
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            {roles.map((role, idx) => (
              <option key={idx} value={role}>{role}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-green" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>

      {/* User List */}
      <div className="card">
        <div className="user-list-header">
          <h2>👥 All Users ({pagination.totalUsers})</h2>
          <div className="filters">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={handleSearchChange}
              className="search-input"
            />
            <select value={roleFilter} onChange={handleRoleFilterChange} className="role-filter">
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <>
            <div className="table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Role</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user._id?.slice(-6) || 'N/A'}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>{user.city || 'N/A'}</td>
                      <td>{user.role}</td>
                      <td className="actions">
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="btn btn-red"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              
              <span className="page-info">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ManageUsers;
