import React, { useState } from "react";
import "./ManageClasses.css";
import { useAdmin } from "../../contexts/adminContext";

function ManageClasses() {
  const [newClass, setNewClass] = useState({ grade: "", section: "" });
  const [removeClass, setRemoveClass] = useState("");
  const [promoteGrade, setPromoteGrade] = useState("");

  const { classes, setClasses, createClass, addActivity } = useAdmin();

  // Create new class
  const handleCreateClass = (e) => {
    e.preventDefault();
    const className = `${newClass.grade}-${newClass.section.toUpperCase()}`;
    if (classes.includes(className)) {
      alert("⚠️ Class already exists!");
      return;
    }
    createClass(className); // ✅ logs automatically
    setNewClass({ grade: "", section: "" });
  };

  // Remove a class
  const handleRemoveClass = (e) => {
    e.preventDefault();
    setClasses(classes.filter((c) => c !== removeClass));
    addActivity("Admin", `Removed class ${removeClass}`); // ✅ log
    setRemoveClass("");
  };

  // Promote students
  const handlePromote = (e) => {
    e.preventDefault();
    addActivity(
      "Admin",
      `Promoted students from Grade ${promoteGrade} to Grade ${+promoteGrade + 1}`
    );
    setPromoteGrade("");
  };

  return (
    <div className="manage-classes">
      {/* Create Class */}
      <div className="card_c">
        <h2>📘 Create a New Class</h2>
        <form onSubmit={handleCreateClass} className="form">
          <input
            type="number"
            placeholder="Grade (e.g., 6)"
            value={newClass.grade}
            onChange={(e) => setNewClass({ ...newClass, grade: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Section (e.g., A)"
            value={newClass.section}
            onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-green">Create</button>
        </form>
      </div>

      {/* Remove Class */}
      <div className="card_c">
        <h2>❌ Remove a Class</h2>
        <form onSubmit={handleRemoveClass} className="form">
          <select
            value={removeClass}
            onChange={(e) => setRemoveClass(e.target.value)}
            required
          >
            <option value="">Select Class</option>
            {classes.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-red">Remove</button>
        </form>
      </div>

      {/* Promote Students */}
      <div className="card_c">
        <h2>📈 Promote Students</h2>
        <form onSubmit={handlePromote} className="form">
          <select
            value={promoteGrade}
            onChange={(e) => setPromoteGrade(e.target.value)}
            required
          >
            <option value="">Select Grade</option>
            {[...new Set(classes.map((c) => c.split("-")[0]))].map((grade, i) => (
              <option key={i} value={grade}>Grade {grade}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-blue">Promote</button>
        </form>
      </div>
    </div>
  );
}

export default ManageClasses;
