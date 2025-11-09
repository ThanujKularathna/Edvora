import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./ManageStudents.css";

function ManageStudents() {
  const [classes, setClasses] = useState([]);
  const [studentAssignments, setStudentAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [assignStudentLoading, setAssignStudentLoading] = useState(false);
  const [removeStudentLoading, setRemoveStudentLoading] = useState(false);
  // const [csvLoading, setCsvLoading] = useState(false);
  const [fetchingStudentClasses, setFetchingStudentClasses] = useState(false);

  const [assignStudent, setAssignStudent] = useState({ email: "", class: "" });
  const [removeStudent, setRemoveStudent] = useState({ email: "", class: "" });
  // const [csvFile, setCsvFile] = useState(null);
  // const [csvData, setCsvData] = useState([]);
  // const [duplicates, setDuplicates] = useState([]);
  // const [csvPreview, setCsvPreview] = useState([]);
  // const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, assignmentsRes] = await Promise.all([
        fetch("/api/admin/classes", { credentials: "include" }),
        fetch("/api/admin/student-assignments", { credentials: "include" }),
      ]);

      const [classesData, assignmentsData] = await Promise.all([
        classesRes.json(),
        assignmentsRes.json(),
      ]);

      if (classesData.status === "success")
        setClasses(classesData.data.classes.map((c) => c.className));
      if (assignmentsData.status === "success") {
        const assignments = {};
        Object.entries(assignmentsData.data.assignments).forEach(
          ([email, data]) => {
            assignments[email.toLowerCase()] = (data.classes || []).filter(
              (c) => c !== null && c !== undefined
            );
          }
        );
        setStudentAssignments(assignments);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentClasses = async (email) => {
    if (!email || !email.includes("@")) return;

    setFetchingStudentClasses(true);
    try {
      const response = await fetch(
        `/api/admin/student-classes/${encodeURIComponent(email)}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setStudentAssignments((prev) => ({
          ...prev,
          [email.toLowerCase()]: data.data.classes || [],
        }));
      } else {
        setStudentAssignments((prev) => ({
          ...prev,
          [email.toLowerCase()]: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching student classes:", error);
      setStudentAssignments((prev) => ({
        ...prev,
        [email.toLowerCase()]: [],
      }));
    } finally {
      setFetchingStudentClasses(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (removeStudent.email) {
        fetchStudentClasses(removeStudent.email);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [removeStudent.email]);

  const handleAssignStudent = async (e) => {
    e.preventDefault();
    setAssignStudentLoading(true);
    try {
      const response = await fetch("/api/admin/assign-student-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: assignStudent.email,
          className: assignStudent.class,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setStudentAssignments((prev) => {
          const lowerEmail = assignStudent.email.toLowerCase();
          const current = prev[lowerEmail] || [];
          return { ...prev, [lowerEmail]: [...current, assignStudent.class] };
        });
        setAssignStudent({ email: "", class: "" });
        alert("✅ Student assigned successfully!");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error assigning student");
    } finally {
      setAssignStudentLoading(false);
    }
  };

  const handleRemoveStudent = async (e) => {
    e.preventDefault();
    setRemoveStudentLoading(true);
    try {
      const response = await fetch("/api/admin/remove-student-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: removeStudent.email,
          className: removeStudent.class,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setStudentAssignments((prev) => {
          const lowerEmail = removeStudent.email.toLowerCase();
          const current = prev[lowerEmail] || [];
          return {
            ...prev,
            [lowerEmail]: current.filter((c) => c !== removeStudent.class),
          };
        });
        setRemoveStudent({ email: "", class: "" });
        alert("✅ Student removed successfully!");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error removing student");
    } finally {
      setRemoveStudentLoading(false);
    }
  };

  // const handleFileSelect = (e) => {
  //   const file = e.target.files[0];
  //   setCsvFile(file);

  //   if (file) {
  //     Papa.parse(file, {
  //       header: true,
  //       skipEmptyLines: true,
  //       complete: (result) => {
  //         const rows = result.data;
  //         const seen = new Set();
  //         const dupes = [];

  //         rows.forEach((row, i) => {
  //           const email = row.email?.trim().toLowerCase();
  //           const key = `${email}-${row.class}`;

  //           if (seen.has(key)) {
  //             dupes.push({ ...row, rowNumber: i + 2 });
  //           }
  //           seen.add(key);
  //         });

  //         setCsvPreview(rows);
  //         setDuplicates(dupes);
  //         setShowPreview(true);
  //       }
  //     });
  //   } else {
  //     setCsvPreview([]);
  //     setShowPreview(false);
  //   }
  // };

  // const handleUploadCSV = async (e) => {
  //   e.preventDefault();
  //   if (!csvFile || csvPreview.length === 0) {
  //     alert("Please select a CSV file.");
  //     return;
  //   }

  //   setCsvLoading(true);
  //   const seen = new Set();
  //   let successCount = 0;
  //   let errorCount = 0;

  //   for (const [i, row] of csvPreview.entries()) {
  //     const email = row.email?.trim().toLowerCase();
  //     const key = `${email}-${row.class}`;

  //     if (seen.has(key)) continue;
  //     seen.add(key);

  //     try {
  //       if (row.class) {
  //         const classResponse = await fetch("/api/admin/assign-student-class", {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           credentials: "include",
  //           body: JSON.stringify({ email, className: row.class }),
  //         });
  //         const classData = await classResponse.json();
  //         if (classData.status === "success") successCount++;
  //         else errorCount++;
  //       }
  //     } catch (error) {
  //       console.error(error);
  //       errorCount++;
  //     }
  //   }

  //   setCsvData(csvPreview);
  //   alert(`✅ CSV processed! Success: ${successCount}, Errors: ${errorCount}`);

  //   setCsvFile(null);
  //   setCsvPreview([]);
  //   setShowPreview(false);
  //   fetchData();
  //   setCsvLoading(false);
  // };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="manage-students">
      {/* 1️⃣ Assign Student to Class */}
      <div className="card_s">
        <h2>👩🎓 Assign Student to a Class</h2>
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
          <button
            type="submit"
            className="btn btn-green"
            disabled={assignStudentLoading}
          >
            {assignStudentLoading ? "Assigning..." : "Assign"}
          </button>
        </form>
      </div>

      {/* 2️⃣ Remove Student */}
      <div className="card_s">
        <h2 style={{ color: "black" }}>❌ Remove Student from a Class</h2>
        <form onSubmit={handleRemoveStudent} className="form">
          <input
            type="email"
            placeholder="Student Email"
            value={removeStudent.email}
            onChange={(e) =>
              setRemoveStudent({ email: e.target.value, class: "" })
            }
            required
          />
          <select
            value={removeStudent.class}
            onChange={(e) =>
              setRemoveStudent({ ...removeStudent, class: e.target.value })
            }
            required
            disabled={!removeStudent.email || fetchingStudentClasses}
          >
            <option value="">
              {!removeStudent.email
                ? "Enter student email first"
                : fetchingStudentClasses
                ? "Loading classes..."
                : studentAssignments[removeStudent.email?.toLowerCase()]
                    ?.length > 0
                ? "Select Class"
                : "No classes assigned"}
            </option>
            {removeStudent.email &&
              !fetchingStudentClasses &&
              (studentAssignments[removeStudent.email.toLowerCase()] || []).map(
                (c, i) => (
                  <option key={i} value={c}>
                    {c}
                  </option>
                )
              )}
          </select>
          <button
            type="submit"
            className="btn btn-red"
            disabled={removeStudentLoading}
          >
            {removeStudentLoading ? "Removing..." : "Remove"}
          </button>
        </form>
      </div>

      {/* 3️⃣ Upload CSV - COMMENTED OUT */}
      {/* <div className="card_s">
        <h2 style={{color: 'black'}}>📂 Assign Students to Classes (CSV)</h2>
        <form onSubmit={handleUploadCSV} className="form">
          <input type="file" accept=".csv" onChange={handleFileSelect} />
          {showPreview && (
            <button type="submit" className="btn btn-green" disabled={csvLoading}>
              {csvLoading ? "Processing..." : "Confirm Upload"}
            </button>
          )}
        </form>

        {showPreview && csvPreview.length > 0 && (
          <div className="csv-preview">
            <h3>📋 Preview Data (Review before upload)</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      duplicates.some(
                        (d) => d.email === row.email && d.class === row.class
                      ) ? "duplicate" : ""
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

        {csvData.length > 0 && !showPreview && (
          <div className="csv-preview">
            <h3>📋 Processed Data</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Class</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.email}</td>
                    <td>{row.class}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div> */}
    </div>
  );
}

export default ManageStudents;
