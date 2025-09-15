// pages/admin/ManageSubjects.jsx
import React, { useState } from "react";
import "./ManageSubjects.css";
import { useAdmin } from "../../contexts/adminContext";

function ManageSubjects() {
  const { subjects, createSubject, removeSubject } = useAdmin();
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // Create
  const handleCreateSubject = (e) => {
    e.preventDefault();
    createSubject(newSubject.trim());
    setNewSubject("");
  };

  // Remove
  const handleRemoveSubject = (e) => {
    e.preventDefault();
    removeSubject(selectedSubject);
    setSelectedSubject("");
  };

  return (
    <div className="manage-subjects">
      {/* Create Subject */}
      <div className="card_s">
        <h2>➕ Create Subject</h2>
        <form onSubmit={handleCreateSubject} className="form">
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-green">Create</button>
        </form>
      </div>

      {/* Remove Subject */}
      <div className="card_s">
        <h2>❌ Remove Subject</h2>
        <form onSubmit={handleRemoveSubject} className="form">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subj, idx) => (
              <option key={idx} value={subj}>{subj}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-red">Remove</button>
        </form>
      </div>

      {/* List for clarity */}
      <div className="card_s">
        <h2>📋 Current Subjects</h2>
        <ul>
          {subjects.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </div>
    </div>
  );
}

export default ManageSubjects;
