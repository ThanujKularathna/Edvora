import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, user, error } = useAuth();

  //console.log(user.data); works
  // console.log(user);

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role;
      // console.log(userRole);
      if (userRole === "student") {
        navigate("/student-dashboard"); //{replace: true} not need
      } else if (userRole === "teacher") {
        navigate("/teacher-dashboard");
      } else if (userRole === "admin") {
        navigate("/admin");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLocalError("");

    try {
      await login(email, password);
    } catch (err) {
      setLocalError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="E">Welcome Back</h2>
      <p>Welcome back, Let’s dive into today’s lessons.</p>
      <form onSubmit={handleSubmit}>
        {(error || localError) && (
          <div className="error-message">{error || localError}</div> //Incorrect email or password
        )}
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Log In"}
        </button>
        <div className="form-footer">
          <a href="/forgot-password">Forgot Password?</a>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
