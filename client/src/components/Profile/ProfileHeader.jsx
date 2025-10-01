import React, { useState } from "react";
import { useAuth } from "../../contexts/authContext";
import "./Profile.css";

export default function ProfileHeader({ name }) {
  const { user, updateUser } = useAuth();
  const defaultImg = "/img/users/default.jpg";
  const [profileImg, setProfileImg] = useState(user?.photo ? `/img/users/${user.photo}` : defaultImg);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // handle when user selects a file
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const imgUrl = URL.createObjectURL(file);
      setProfileImg(imgUrl);
      
      // Upload to server
      const formData = new FormData();
      formData.append('photo', file);
      
      try {
        const response = await fetch('/api/v1/users/updatePhoto', {
          method: 'PATCH',
          credentials: 'include',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          updateUser(data.user);
          setProfileImg(`/img/users/${data.user.photo}`);
        }
      } catch (error) {
        console.error('Error uploading photo:', error);
        setProfileImg(user?.photo ? `/img/users/${user.photo}` : defaultImg);
      } finally {
        setUploading(false);
      }
    }
  };

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle change password
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const response = await fetch('/api/v1/users/updateMyPassword', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password changed successfully!");
        // reset form and close modal
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setError("");
        setShowModal(false);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="profile-header">
      <div className="profile-header-left">
        <div className="profile-pic-container">
          <img 
            src={profileImg} 
            alt="profile" 
            className="profile-pic"
            onError={(e) => {
              e.target.src = defaultImg;
            }}
          />
        </div>
        <h2>{name}</h2>
      </div>
      <div className="profile-buttons">
        <input
            type="file"
            accept="image/*"
            id="upload-photo"
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        <label htmlFor="upload-photo" className="change-photo-btn">
            {uploading ? 'Uploading...' : 'Change Photo'}
          </label>
        <button className="reset" onClick={() => setShowModal(true)}>
          Change Password
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Change Password</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                value={formData.currentPassword}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              {error && <p className="error">{error}</p>}

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
