import React,{ useState, useEffect } from "react";// ✅ Import hooks
import axios from "axios";// ✅ Import axios for HTTP requests
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css"; 
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";




const StudentDashboard = () => {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [studentName, setStudentName] = useState("Nimal"); // Default name (can be fetched from backend too)


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
    const fetchSubjects = async () => {
      try {
        const email = localStorage.getItem("studentEmail"); // Get email from localStorage or auth context
        const response = await axios.get(`http://localhost:5000/api/student/subjects?email=${email}`);
        setSubjects(response.data.subjects);
        setStudentName(response.data.name || "Student"); // Optional: set student name
      } catch (error) {
        console.error("Failed to fetch subjects", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
  const mockSubjects = {
    "student1@example.com": ["Maths", "Science", "History"],
    // "student2@example.com": ["English", "Art", "Sinhala"]
  };
  const email = localStorage.getItem("studentEmail") || "student1@example.com"; // fallback
    setSubjects(mockSubjects[email] || []);
    setStudentName(email.split("@")[0]); // optional: auto extract name
  
  }, []);



  return (
    <div className="dashboard-container">
      
      <Navbar />

      {/* <button onClick={handleLogout}>Log out</button> */}

      {/* Greeting */}
      <div className="greeting">
        <h4>{getGreeting()}  Nimal !</h4>
        <p className="greeting-begin">Let’s keep learning today</p>
      </div>

      

      
      {/* Subjects */}
      <div className="section">
        
        <h3>Subjects</h3>

        <div className="subjects-grid">
          {subjects.map((subject, index) => (
            <button
              key={index}
              className={`subject-btn ${index === 0 ? "active" : ""}`}
              onClick={() => handleSubjectClick(subject)}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Assignments */}
      <div className="section">
        <h3 className="h3-sp">Upcomming Homeworks</h3>
        <div className="assignments">
          {["Maths", "Sinhala",].map((subject, index) => (
            <button
              key={index}
              className={`assignment-card-sp ${index === 0 ? "highlight" : ""}`}
            >
              <p><strong>{subject}</strong></p>
              <p>Due: July 10 /2025</p>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Footer />
   
    </div>
  );
};

export default StudentDashboard;
