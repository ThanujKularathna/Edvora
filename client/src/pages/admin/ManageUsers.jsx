import React, { useState, useEffect } from "react";
import "./ManageUsers.css";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const roles = ["admin", "teacher", "student"];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.status === 'success') {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

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

    const emailExists = users.some(
      (u) => u.email.toLowerCase() === formData.email.toLowerCase()
    );
    if (emailExists) {
      alert("❌ Email already exists!");
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
        setUsers([...users, data.data.user]);
        setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "", phoneNumber: "", city: "" });
        alert("✅ User created successfully!");
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
        setUsers(users.filter((u) => u._id !== userId));
        alert("✅ User deleted successfully!");
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

  // Handle update user status (simplified - just for demo)
  const handleToggleStatus = async (userId) => {
    const user = users.find(u => u._id === userId);
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setUsers(users.map(u => 
          u._id === userId ? { ...u, status: newStatus } : u
        ));
        alert(`✅ User ${newStatus.toLowerCase()} successfully!`);
      } else {
        alert("❌ Failed to update user status");
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert("❌ Error updating user");
    } finally {
      setLoading(false);
    }
  };

  if (loading && users.length === 0) {
    return <div className="manage-users"><p>Loading users...</p></div>;
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
        <h2>👥 All Users ({users.length})</h2>
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Role</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id || user.id}>
                  <td>{user._id?.slice(-6) || user.id?.slice(-6) || 'N/A'}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber || 'N/A'}</td>
                  <td>{user.city || 'N/A'}</td>
                  <td>{user.role}</td>
                  <td>{user.status || 'Active'}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleToggleStatus(user._id)}
                      className={user.status === "Inactive" ? "btn btn-green" : "btn btn-yellow"}
                      disabled={loading}
                    >
                      {user.status === "Inactive" ? "Activate" : "Deactivate"}
                    </button>
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
      </div>
    </div>
  );
}

export default ManageUsers;
