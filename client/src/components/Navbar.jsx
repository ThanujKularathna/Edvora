import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Optional: for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleHomeClick = () => {
    if (!user) return navigate("/");

    if (user.role === "student") {
      navigate("/student-dashboard");
    } else if (user.role === "teacher") {
      navigate("/teacher-dashboard");
    } else if (user.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/");
    }
  };
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/Edvora.png" alt="Logo" className="logo" />
      </div>

      <div className="navbar-right">
        <div
          className="nav-item"
          onClick={handleHomeClick}
          style={{ cursor: "pointer" }}
        >
          <div className="nav-circle" onClick={handleHomeClick}>
            <FontAwesomeIcon icon={faHome} className="nav-icon" />
          </div>
          <span className="nav-label">Home</span>
        </div>

        <Link
          to="/profile"
          className="nav-item"
          style={{ textDecoration: "none" }}
        >
          <div className="nav-circle">
            <FontAwesomeIcon icon={faUser} className="nav-icon" />
          </div>
          <span className="nav-label">Profile</span>
        </Link>

        <div
          className="nav-item"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <div className="nav-circle" onClick={handleLogout}>
            <FontAwesomeIcon icon={faPowerOff} className="nav-icon" />
          </div>
          <span className="nav-label">Log out</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
