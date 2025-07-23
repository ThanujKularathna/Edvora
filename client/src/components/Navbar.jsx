import React from "react";
// import { Link } from "react-router-dom";
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
        <div className="nav-item">
          <div className="nav-circle">
            <FontAwesomeIcon icon={faHome} className="icon" />
          </div>
          <div
            className="nav-link"
            onClick={handleHomeClick}
            style={{ cursor: "pointer" }}
          >
            Home
          </div>
        </div>

        <div className="nav-item">
          <div className="nav-circle">
            <FontAwesomeIcon icon={faUser} className="icon" />
          </div>
          <a className="nav-link" href="/profile">
            Profile
          </a>
          {/* <Link to="/profile">Profile</Link> */}
        </div>

        <div className="nav-item">
          <div className="nav-circle">
            <FontAwesomeIcon icon={faPowerOff} className="icon" />
          </div>
          <div
            style={{ cursor: "pointer" }}
            className="nav-link"
            onClick={handleLogout}
          >
            Log out
          </div>
          {/* <Link to="/">Log out</Link> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
