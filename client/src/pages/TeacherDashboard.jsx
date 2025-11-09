import React, { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./TeacherDashboard.css";

import { useAuth } from "../contexts/authContext";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log("User data:", user);

  // const [assignedClasses, setAssignedClasses] = useState([]);
  // const [teacherName, setTeacherName] = useState("Teacher");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    else if (hour >= 12 && hour < 17) return "Good Afternoon";
    else return "Good Evening";
  };

  const handleClassClick = (className) => {
    navigate(`/teacher/class/${className}`);
  };

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="teacher-mc">
        {/* Greeting */}

        <div className="greeting">
          <h4>{getGreeting()} Teacher!</h4>
          <p className="greeting-begin">
            Ready to guide your students to success today?
          </p>
        </div>

        {/* Assigned Classes */}
        <h3>Assigned Classes</h3>
        <div className="subjects-grid">
          {user?.classes && Array.isArray(user.classes) ? (
            user.classes.map((classObj, index) => (
              <button
                key={index}
                className="subject-btn"
                onClick={() => handleClassClick(classObj.className)}
              >
                Grade {classObj.className}
              </button>
            ))
          ) : (
            <p>No classes assigned</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;
