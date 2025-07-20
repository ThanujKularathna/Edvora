import React from "react";
// import { Link } from "react-router-dom";
import "./Navbar.css"; // Optional: for styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUser, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../contexts/authContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  // const { user, isAuthenticated } = useAuth();
  // let dashBoardType = "";
  // switch (user.role) {
  //   case "student":
  //     dashBoardType = "student-dashboard";
  //     break;
  //   case "teacher":
  //     dashBoardType = "teacher-dashboard";
  //     break;

  //   case "admin":
  //     dashBoardType = "admin-dashboard";
  //     break;

  //   default:
  //     dashBoardType = "";
  //     break;
  // }
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
          <a className="nav-link" href="/student-dashboard">
            Home
          </a>
          {/* <Link to="/student-dashboard">Home</Link> */}
        </div>

        <div className="nav-item">
          <div className="nav-circle">
            <FontAwesomeIcon icon={faUser} className="icon" />
          </div>
          <a className="nav-link" href="/profie">
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
