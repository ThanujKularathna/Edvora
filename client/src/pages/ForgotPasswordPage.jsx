import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("api/v1/users/forgetPassword", {
        email,
      });

      if (response.data.status === "success") {
        setSuccess("Verification code sent to " + email);
        // navigate("/reset-password");
      }
    } catch (error) {
      const { data } = error.response || {};
      const { status, message } = data || {};

      if (status === "failed") {
        setError(message || "Failed to send email");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="left-section">
        <img src="/lgform.png" alt="Illustration" />
      </div>
      <div className="right-section">
        <div className="login-container">
          <h2>Forgot your Password?</h2>
          <p>
            Don’t worry, it happens. Just enter your email and we’ll send you a
            email to reset it.
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            {error && (
              <div style={{ color: "red" }} className="error-message">
                {error}
              </div>
            )}
            {success && (
              <div style={{}} className="success-message">
                {success}
              </div>
            )}
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : success ? "Email Sent" : "Send Email"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
