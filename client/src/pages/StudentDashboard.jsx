import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import "./StudentDashboard.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [subjects, setSubjects] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [upcomingAssignments, setUpcomingAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    console.log("Logged out");
    navigate("/");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    else if (hour >= 12 && hour < 17) return "Good Afternoon";
    else if (hour >= 17 && hour < 21) return "Good Evening";
    else return "Good Night";
  };

  const handleSubjectClick = (subject) => {
    navigate(`/subject/${subject}`);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/v1/student/dashboard", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();

        if (data.status === "success") {
          setSubjects(data.data.subjects || []);
          setStudentName(data.data.student.name || "Student");
          setUpcomingAssignments(data.data.upcomingAssignments || []);
          console.log(data.data.upcomingAssignments);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        console.log(error);
        // Fallback data
        setSubjects(["Mathematics", "Science", "English"]);
        setStudentName(user?.name || "Student");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  return (
    <div className="dashboard-container">
      <Navbar />

      {/* <button onClick={handleLogout}>Log out</button> */}

      {/* Greeting */}
      <div className="greeting">
        <h4>
          {getGreeting()} {studentName}!
        </h4>
        <p className="greeting-begin">Let’s keep learning today</p>
      </div>

      {/* Subjects */}
      <div className="section">
        <h3>Subjects</h3>

        <div className="subjects-grid">
          {loading ? (
            <p>Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p>No subjects available</p>
          ) : (
            subjects.map((subject, index) => (
              <button
                key={subject._id || index}
                className="subject-btn "
                onClick={() => handleSubjectClick(subject.name || subject)}
              >
                {subject.name || subject}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="section">
        <h3 className="h3-sp">Upcomming Homeworks</h3>
        <div className="assignments">
          {loading ? (
            <p>Loading assignments...</p>
          ) : upcomingAssignments.length === 0 ? (
            <p>No upcoming assignments</p>
          ) : (
            upcomingAssignments.map((assignment, index) => (
              <button
                key={assignment._id || index}
                className={`assignment-card-sp ${
                  index === 0 ? "highlight" : ""
                }`}
              >
                <div><strong>{assignment.title}</strong></div>
                <div>Subject: {assignment.subject?.name || assignment.subject}</div>
                <div>Teacher: {assignment.teacher?.name || "Unknown"}</div>
                <div>Due: {new Date(assignment.deadline).toLocaleDateString()}</div>
              </button>
            ))
          )}
        </div>
      </div>



      {/* Footer */}
      <Footer />
    </div>
  );
};

export default StudentDashboard;
