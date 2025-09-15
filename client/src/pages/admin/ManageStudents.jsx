import React, { useState } from "react";
import Papa from "papaparse";
import "./ManageStudents.css"; 
import { useAdmin } from "../../contexts/adminContext";

function ManageStudents() {
  const [assignStudent, setAssignStudent] = useState({ email: "", class: "" });
  const [removeStudent, setRemoveStudent] = useState({ email: "", class: "" });
  const [promoteGrade, setPromoteGrade] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]); 
  const [duplicates, setDuplicates] = useState([]); 

  // ✅ Access admin context
  const { 
    users = [], 
    classes = [], 
    studentAssignments = {}, 
    assignStudentToClass, 
    removeStudentFromClass 
  } = useAdmin();

  // ✅ Assign student
  const handleAssignStudent = (e) => {
    e.preventDefault();
    const userExists = users.some(
      (u) => u.email.toLowerCase() === assignStudent.email.toLowerCase()
    );
    if (!userExists) {
      alert("❌ Student not found in Manage Users");
      return;
    }
    assignStudentToClass(assignStudent.email, assignStudent.class);
    alert(`✅ Assigned student ${assignStudent.email} to ${assignStudent.class}`);
    setAssignStudent({ email: "", class: "" });
  };

  // ✅ Remove student
  const handleRemoveStudent = (e) => {
    e.preventDefault();
    const userExists = users.some(
      (u) => u.email.toLowerCase() === removeStudent.email.toLowerCase()
    );
    if (!userExists) {
      alert("❌ Student not found in Manage Users");
      return;
    }
    removeStudentFromClass(removeStudent.email, removeStudent.class);
    alert(`❌ Removed student ${removeStudent.email} from ${removeStudent.class}`);
    setRemoveStudent({ email: "", class: "" });
  };

  // ✅ Promote students
  const handlePromote = (e) => {
    e.preventDefault();
    alert(
      `📈 Promoted students from Grade ${promoteGrade} to Grade ${+promoteGrade + 1}`
    );
    setPromoteGrade("");
  };

  // ✅ Upload & Parse CSV
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
          const key = `${email}-${row.class}`;

          // 🔁 check duplicate in CSV
          if (seen.has(key)) {
            dupes.push({ ...row, rowNumber: i + 2 });
          } else {
            seen.add(key);
          }

          // 🔍 check against Manage Users
          const exists = users.some((u) => u.email.toLowerCase() === email);
          if (!exists) {
            invalidEmails.push({ ...row, rowNumber: i + 2 });
          }
        });

        setCsvData(rows);
        setDuplicates(dupes);

        if (dupes.length > 0) {
          alert(`⚠️ Found ${dupes.length} duplicate student entries!`);
        } else if (invalidEmails.length > 0) {
          alert(
            `❌ These students are not in Manage Users:\n${invalidEmails
              .map((d) => `${d.email} (Row ${d.rowNumber})`)
              .join("\n")}`
          );
        } else {
          alert("✅ Student CSV uploaded successfully!");
        }
      },
    });

    setCsvFile(null);
  };

  return (
    <div className="manage-students">
      {/* Assign Student */}
      <div className="card_s">
        <h2>👩‍🎓 Assign Student to a Class</h2>
        <form onSubmit={handleAssignStudent} className="form">
          <input
            type="email"
            placeholder="Student Email"
            value={assignStudent.email}
            onChange={(e) =>
              setAssignStudent({ ...assignStudent, email: e.target.value })
            }
            required
          />
          <select
            value={assignStudent.class}
            onChange={(e) =>
              setAssignStudent({ ...assignStudent, class: e.target.value })
            }
            required
          >
            <option value="">Select Class</option>
            {classes.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button type="submit" className="btn btn-green">
            Assign
          </button>
        </form>
      </div>

      {/* Remove Student */}
      <div className="card_s">
        <h2>❌ Remove Student from a Class</h2>
        <form onSubmit={handleRemoveStudent} className="form">
          <input
            type="email"
            placeholder="Student Email"
            value={removeStudent.email}
            onChange={(e) =>
              setRemoveStudent({ ...removeStudent, email: e.target.value })
            }
            required
          />
          <select
            value={removeStudent.class}
            onChange={(e) =>
              setRemoveStudent({ ...removeStudent, class: e.target.value })
            }
            required
          >
            <option value="">Select Class</option>
            {(studentAssignments[removeStudent.email?.toLowerCase()] || []).map(
              (c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              )
            )}
          </select>
          <button type="submit" className="btn btn-red">
            Remove
          </button>
        </form>
      </div>

      {/* Promote Students */}
      <div className="card_s">
        <h2>📈 Promote Students</h2>
        <form onSubmit={handlePromote} className="form">
          <select
            value={promoteGrade}
            onChange={(e) => setPromoteGrade(e.target.value)}
            required
          >
            <option value="">Select Grade</option>
            <option value="6">Grade 6</option>
            <option value="7">Grade 7</option>
            <option value="8">Grade 8</option>
          </select>
          <button type="submit" className="btn btn-blue">
            Promote
          </button>
        </form>
      </div>

      {/* Upload CSV */}
      <div className="card_s">
        <h2>📂 Upload Students via CSV</h2>
        <form onSubmit={handleUploadCSV} className="form">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
          />
          <button type="submit" className="btn btn-green">
            Upload
          </button>
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
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      duplicates.some(
                        (d) => d.email === row.email && d.class === row.class
                      )
                        ? "duplicate"
                        : ""
                    }
                  >
                    <td>{row.email}</td>
                    <td>{row.class}</td>
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

export default ManageStudents;
