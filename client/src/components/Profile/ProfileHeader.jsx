import React, { useState } from "react";
import "./Profile.css";
import defaultImg from "./profile.png";

export default function ProfileHeader({ name }) {
  const [profileImg, setProfileImg] = useState(defaultImg);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  // handle when user selects a file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file); // create preview
      setProfileImg(imgUrl);
    }
  };

  // handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // handle reset password
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New password and confirm password do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // ✅ Just frontend validation here
    alert("Password changed successfully (frontend only).");

    // reset form and close modal
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setError("");
    setShowModal(false);
  };

  return (
    <div className="profile-header">
      <div className="profile-header-left">
        <div className="profile-pic-container">
          <img src={profileImg} alt="profile" className="profile-pic" />
          
          
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
            Change Photo
          </label>
        <button className="reset" onClick={() => setShowModal(true)}>
          Reset Password
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reset Password</h3>
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
