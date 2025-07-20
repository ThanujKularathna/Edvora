import React, { useState, useEffect } from "react";

import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./TeacherDashboard.css";

import { useAuth } from "../contexts/authContext";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log(user);

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

  // useEffect(() => {
  //   // Mock teacher data
  //   const mockClasses = {
  //     "teacher1@example.com": {
  //       name: "Mr. Silva",
  //       classes: [
  //         "Grade 6-A",
  //         "Grade 6-B",
  //         "Grade 6-C",
  //         "Grade 10-A",
  //         "Grade 9-C",
  //       ],
  //     },
  //   };

  //   const email =
  //     localStorage.getItem("teacherEmail") || "teacher1@example.com";
  //   const teacherData = mockClasses[email] || { name: "Teacher", classes: [] };

  //   // setAssignedClasses(teacherData.classes);
  //   // setTeacherName(teacherData.name);
  // }, []);

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
          {user.classes.map((className, index) => (
            <button
              key={index}
              className="subject-btn"
              onClick={() => handleClassClick(className)}
            >
              Grade {className}
            </button>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TeacherDashboard;
