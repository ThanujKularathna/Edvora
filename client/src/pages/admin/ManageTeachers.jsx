import React, { useState } from "react";
import Papa from "papaparse";
import "./ManageTeachers.css";
import { useAdmin } from "../../contexts/adminContext";

function ManageTeachers() {
  const [teacherClass, setTeacherClass] = useState({ email: "", class: "" });
  const [removeTeacher, setRemoveTeacher] = useState({ email: "", class: "" });
  const [assignSubject, setAssignSubject] = useState({ email: "", subject: "" });
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [duplicates, setDuplicates] = useState([]);

  const {
    users = [],
    classes = [],
    subjects = [], // ✅ Added subjects list from context
    teacherAssignments = {},
    assignTeacherToClass,
    removeTeacherFromClass,
    assignSubjectToTeacher,
  } = useAdmin();

  // ---------- Assign Teacher to Class ----------
  const handleAssignClass = (e) => {
    e.preventDefault();
    const userExists = users.some(
      (u) => u.email.toLowerCase() === teacherClass.email.toLowerCase()
    );
    if (!userExists) {
      alert("❌ Teacher not found in Manage Users");
      return;
    }
    assignTeacherToClass(teacherClass.email, teacherClass.class);
    setTeacherClass({ email: "", class: "" });
  };

  // ---------- Remove Teacher ----------
  const handleRemoveClass = (e) => {
    e.preventDefault();
    const userExists = users.some(
      (u) => u.email.toLowerCase() === removeTeacher.email.toLowerCase()
    );
    if (!userExists) {
      alert("❌ Teacher not found in Manage Users");
      return;
    }
    removeTeacherFromClass(removeTeacher.email, removeTeacher.class);
    setRemoveTeacher({ email: "", class: "" });
  };

  // ---------- Assign Subjects ----------
  const handleAssignSubjects = (e) => {
    e.preventDefault();
    const userExists = users.some(
      (u) => u.email.toLowerCase() === assignSubject.email.toLowerCase()
    );
    if (!userExists) {
      alert("❌ Teacher not found in Manage Users");
      return;
    }

    if (!assignSubject.subject) {
      alert("❌ Please select a subject");
      return;
    }

    assignSubjectToTeacher(assignSubject.email, assignSubject.subject);
    setAssignSubject({ email: "", subject: "" });
  };

  // ---------- Upload & Parse CSV ----------
  const handleUploadCSV = (e) => {
    e.preventDefault();
    if (!csvFile) {
      alert("Please select a CSV file.");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data;
        const seen = new Set();
        const dupes = [];
        const invalidEmails = [];

        rows.forEach((row, i) => {
          const email = row.email?.trim().toLowerCase();
          const key = `${email}-${row.class}-${row.subject}`;

          // duplicate check
          if (seen.has(key)) {
            dupes.push({ ...row, rowNumber: i + 2 });
          } else {
            seen.add(key);
          }

          // check if teacher exists
          const userExists = users.some((u) => u.email.toLowerCase() === email);
          if (!userExists) {
            invalidEmails.push({ ...row, rowNumber: i + 2 });
          } else {
            // ✅ Assign automatically
            if (row.class) assignTeacherToClass(email, row.class);
            if (row.subject) assignSubjectToTeacher(email, row.subject);
          }
        });

        setCsvData(rows);
        setDuplicates(dupes);

        if (dupes.length > 0) {
          alert(`⚠️ Found ${dupes.length} duplicate entries!`);
        } else if (invalidEmails.length > 0) {
          alert(
            `❌ These teachers are not in Manage Users:\n${invalidEmails
              .map((d) => `${d.email} (Row ${d.rowNumber})`)
              .join("\n")}`
          );
        } else {
          alert("✅ CSV processed successfully!");
        }
      },
    });

    setCsvFile(null);
  };

  return (
    <div className="manage-teachers">
      {/* 1️⃣ Assign Subjects */}
      <div className="card_t">
        <h2>📚 Assign Subjects to Teacher</h2>
        <form onSubmit={handleAssignSubjects} className="form">
          <input
            type="email"
            placeholder="Teacher Email"
            value={assignSubject.email}
            onChange={(e) =>
              setAssignSubject({ ...assignSubject, email: e.target.value })
            }
            required
          />
          <select
            value={assignSubject.subject}
            onChange={(e) =>
              setAssignSubject({ ...assignSubject, subject: e.target.value })
            }
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((subj, i) => (
              <option key={i} value={subj}>
                {subj}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-blue">Assign</button>
        </form>
      </div>

      {/* 2️⃣ Assign Teacher to Class */}
      <div className="card_t">
        <h2>👩‍🏫 Assign Teacher to a Class</h2>
        <form onSubmit={handleAssignClass} className="form">
          <input
            type="email"
            placeholder="Teacher Email"
            value={teacherClass.email}
            onChange={(e) =>
              setTeacherClass({ ...teacherClass, email: e.target.value })
            }
            required
          />
          <select
            value={teacherClass.class}
            onChange={(e) =>
              setTeacherClass({ ...teacherClass, class: e.target.value })
            }
            required
          >
            <option value="">Select Class</option>
            {classes.map((c, i) => (
              <option key={i} value={c}>{c}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-green">Assign</button>
        </form>
      </div>

      {/* 3️⃣ Remove Teacher */}
      <div className="card_t">
        <h2>❌ Remove Teacher from a Class</h2>
        <form onSubmit={handleRemoveClass} className="form">
          <input
            type="email"
            placeholder="Teacher Email"
            value={removeTeacher.email}
            onChange={(e) =>
              setRemoveTeacher({ ...removeTeacher, email: e.target.value })
            }
            required
          />
          <select
            value={removeTeacher.class}
            onChange={(e) =>
              setRemoveTeacher({ ...removeTeacher, class: e.target.value })
            }
            required
          >
            <option value="">Select Class</option>
            {(teacherAssignments[removeTeacher.email?.toLowerCase()] || []).map(
              (c, i) => (
                <option key={i} value={c}>{c}</option>
              )
            )}
          </select>
          <button type="submit" className="btn btn-red">Remove</button>
        </form>
      </div>

      {/* 4️⃣ Upload CSV */}
      <div className="card_t">
        <h2>📂 Upload Teachers to Classes (CSV)</h2>
        <form onSubmit={handleUploadCSV} className="form">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
          />
          <button type="submit" className="btn btn-green">Upload</button>
        </form>

        {/* CSV Preview */}
        {csvData.length > 0 && (
          <div className="csv-preview">
            <h3>📋 Uploaded Data</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      duplicates.some(
                        (d) =>
                          d.email === row.email &&
                          d.class === row.class &&
                          d.subject === row.subject
                      )
                        ? "duplicate"
                        : ""
                    }
                  >
                    <td>{row.email}</td>
                    <td>{row.class}</td>
                    <td>{row.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {duplicates.length > 0 && (
              <div className="warning">
                ⚠️ Duplicates detected in rows:{" "}
                {duplicates.map((d) => d.rowNumber).join(", ")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTeachers;
