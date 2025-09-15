import React, { useState } from "react";
import "./Profile.css";

export default function UserDetails({ fullName, email, city, contact }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName,
    email,   // still stored, but not editable
    city,
    contact,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saved details:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="card1">
      <div className="card1-header">
        <h3>User Details</h3>
        <a href="#" className="edit-link" onClick={() => setIsModalOpen(true)}>
          Edit details
        </a>
      </div>

      {/* Display Mode */}
      <div className="details-row">
        <label>Full Name</label>
        <div className="details-value">{formData.fullName}</div>
      </div>

      <div className="details-row">
        <label>Email address</label>
        <div className="details-value">{formData.email}</div>
      </div>

      <div className="details-row">
        <label>City / Town</label>
        <div className="details-value">{formData.city}</div>
      </div>

      <div className="details-row">
        <label>Contact</label>
        <div className="details-value">{formData.contact}</div>
      </div>

      {/* Popup Modal (without email field) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Edit User Details</h3>

            <div className="modal-field">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="modal-field">
              <label>City / Town</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="modal-field">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
              />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave}>
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
