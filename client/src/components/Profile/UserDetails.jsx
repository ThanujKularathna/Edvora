import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/authContext";
import "./Profile.css";

export default function UserDetails({ fullName, email, city, contact }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    fullName: fullName || '',
    email: email || '',
    city: city || '',
    contact: contact || '',
  });

  useEffect(() => {
    setFormData({
      fullName: fullName || '',
      email: email || '',
      city: city || '',
      contact: contact || '',
    });
  }, [fullName, email, city, contact]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/v1/users/updateProfile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.fullName,
          phone: formData.contact,
          address: formData.city
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        updateUser(data.user);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
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
        <div className="details-value">{formData.fullName || 'Not provided'}</div>
      </div>

      <div className="details-row">
        <label>Email address</label>
        <div className="details-value">{formData.email || 'Not provided'}</div>
      </div>

      <div className="details-row">
        <label>City / Town</label>
        <div className="details-value">{formData.city || 'Not provided'}</div>
      </div>

      <div className="details-row">
        <label>Contact</label>
        <div className="details-value">{formData.contact || 'Not provided'}</div>
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
                value={formData.fullName || ''}
                onChange={handleChange}
              />
            </div>

            <div className="modal-field">
              <label>City / Town</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleChange}
              />
            </div>

            <div className="modal-field">
              <label>Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact || ''}
                onChange={handleChange}
              />
            </div>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleSave} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save'}
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
