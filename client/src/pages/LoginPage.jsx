import React from "react";
import LoginForm from "../components/LoginForm";
// import { loginUser } from "../utils/auth";

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="left-section">
        <img src="lgform.png" alt="Learning" />
      </div>
      <div className="right-section">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
