import React from "react";
import "./Footer.css"; // Optional external CSS file

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGlobe,
  faEnvelope,
  faPhoneVolume,
} from "@fortawesome/free-solid-svg-icons";
import {
  faHouse,
  faUser,
  faTableColumns,
} from "@fortawesome/free-solid-svg-icons";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faCommentDots } from "@fortawesome/free-solid-svg-icons";

import { useAuth } from "../contexts/authContext";

const Footer = () => {
  const { user } = useAuth();
  return (
    <footer className="footer">
      <div className="footer-section-one">
        <div className="div-col">
          <p>Contact us</p>

          <div className="icon-one" style={{ display: "flex", gap: "16px" }}>
            <div
              style={{
                backgroundColor: "#ccc",
                borderRadius: "50%",
                padding: "6px",
              }}
            >
              <FontAwesomeIcon icon={faGlobe} size="2x" color="#111" />
            </div>
            <div
              style={{
                backgroundColor: "#ccc",
                borderRadius: "50%",
                padding: "6px",
              }}
            >
              <FontAwesomeIcon icon={faEnvelope} size="2x" color="#111" />
            </div>
            <div
              style={{
                backgroundColor: "#ccc",
                borderRadius: "50%",
                padding: "6px",
              }}
            >
              <FontAwesomeIcon icon={faPhoneVolume} size="2x" color="#111" />
            </div>
          </div>
        </div>
        <div className="div-col">
          <p style={{ paddingLeft: "50px" }}>
            {user
              ? `You are logged in as ${user.role}`
              : "you are not logged  in"}
          </p>

          <div
            style={{
              padding: "20px",
              color: "#fff",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "40px",
                marginTop: "10px",
              }}
            >
              <FontAwesomeIcon icon={faHouse} size="2x" color="#111" />
              <FontAwesomeIcon icon={faUser} size="2x" color="#111" />
              <FontAwesomeIcon icon={faTableColumns} size="2x" color="#111" />
              <FontAwesomeIcon icon={faBell} size="2x" color="#111" />
            </div>
          </div>
        </div>
        <div className="div-col">
          <p style={{ paddingLeft: "18px" }}>Follow Us</p>

          <div
            style={{
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "center", gap: "16px" }}
            >
              <div
                style={{
                  backgroundColor: "#ccc",
                  borderRadius: "50%",
                  padding: "6px",
                }}
              >
                <FontAwesomeIcon icon={faInstagram} size="2x" color="#111" />
              </div>
              <div
                style={{
                  backgroundColor: "#ccc",
                  borderRadius: "50%",
                  padding: "6px",
                }}
              >
                <FontAwesomeIcon icon={faCommentDots} size="2x" color="#111" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-section-two">
        <div className="text">
          <p>Contact .me</p>
          <p>Copyright @ 2025 code gang</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
