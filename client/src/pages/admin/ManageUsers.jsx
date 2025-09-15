import React, { useState } from "react";
import "./ManageUsers.css"; // Import CSS file
import { useAdmin } from "../../contexts/adminContext"; // ✅ use shared context

function ManageUsers() {
  const { users, setUsers } = useAdmin(); // ✅ shared users from context
  const roles = ["admin", "teacher", "student"];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // Handle form changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle create user with validation
  const handleCreateUser = (e) => {
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

    const nameExists = users.some(
      (u) => u.name.toLowerCase() === formData.name.toLowerCase()
    );
    if (nameExists) {
      alert("❌ Username already exists!");
      return;
    }

    const newUser = {
      id: users.length + 1000,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: "Active",
    };

    setUsers([...users, newUser]);
    setFormData({ name: "", email: "", password: "", confirmPassword: "", role: "" });
  };

  // Handle activate/deactivate/delete
  const handleAction = (id, action) => {
    if (action === "delete") {
      setUsers(users.filter((u) => u.id !== id));
    } else if (action === "toggleStatus") {
      setUsers(
        users.map((u) =>
          u.id === id
            ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
            : u
        )
      );
    }
  };

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
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            {roles.map((role, idx) => (
              <option key={idx} value={role}>{role}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-green">Create User</button>
        </form>
      </div>

      {/* User List */}
      <div className="card">
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.status}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleAction(user.id, "toggleStatus")}
                      className={user.status === "Active" ? "btn btn-yellow" : "btn btn-green"}
                    >
                      {user.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleAction(user.id, "delete")}
                      className="btn btn-red"
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
