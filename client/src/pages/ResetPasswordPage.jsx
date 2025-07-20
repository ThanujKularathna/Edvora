import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      console.log(error);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.patch(
        `/api/v1/users/resetPassword/${token}`,
        {
          password,
          passwordConfirm: confirm,
        }
      );

      if (response.data.status === "success") {
        alert("Password has been reset!");
        navigate("/");
      }
    } catch (error) {
      const { data } = error.response || {};
      const { message } = data || {};
      setError(message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="left-section">
        <img src="/lgform.png" alt="Reset Illustration" />
      </div>
      <div className="right-section">
        <div className="login-container">
          <h2>Set New Password</h2>
          <p>Please enter your new password below.</p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Setting Password..." : "Set Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
