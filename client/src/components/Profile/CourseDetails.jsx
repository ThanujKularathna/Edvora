import React from "react";
import "./Profile.css";

export default function CourseDetails({ role, subjects, classes }) {
  return (
    <div className="card3">
      <h3>{role === "student" ? "Enrolled Subjects" : "Teaching Classes"}</h3>
      <ul>
        {role === "student" &&
          subjects?.map((subject, i) => (
            <li key={i}>
              {subject}
            </li>
          ))}

        {role === "teacher" &&
          classes?.map((classObj, i) => (
            <li key={i}>
              Grade {classObj.className}
            </li>
          ))}
      </ul>
    </div>
  );
}
