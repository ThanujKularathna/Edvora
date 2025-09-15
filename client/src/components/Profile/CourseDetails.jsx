import React from "react";
import "./Profile.css";

export default function CourseDetails({ role, data }) {
  return (
    <div className="card3">
      <h3>{role === "student" ? "Enrolled Subjects" : "Teaching Classes"}</h3>
      <ul>
        {role === "student" &&
          data?.map((item, i) => (
            <li key={i}>
              {item.subject} <span className="teacher">({item.teacher})</span>
            </li>
          ))}

        {role === "teacher" &&
          data?.map((item, i) => (
            <li key={i}>
              {item.className} – {item.subject}
            </li>
          ))}
      </ul>
    </div>
  );
}
