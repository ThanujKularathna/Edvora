import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import "./ManageTeachers.css";

function ManageTeachers() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState({});
  const [loading, setLoading] = useState(false);
  const [assignSubjectLoading, setAssignSubjectLoading] = useState(false);
  const [assignClassLoading, setAssignClassLoading] = useState(false);
  const [removeClassLoading, setRemoveClassLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);

  const [teacherClass, setTeacherClass] = useState({ email: "", class: "" });
  const [removeTeacher, setRemoveTeacher] = useState({ email: "", class: "" });
  const [assignSubject, setAssignSubject] = useState({
    email: "",
    subject: "",
  });
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [fetchingTeacherClasses, setFetchingTeacherClasses] = useState(false);
  const [csvPreview, setCsvPreview] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classesRes, subjectsRes, assignmentsRes] = await Promise.all([
        fetch("/api/admin/classes", { credentials: "include" }),
        fetch("/api/admin/subjects", { credentials: "include" }),
        fetch("/api/admin/teacher-assignments", { credentials: "include" }),
      ]);

      const [classesData, subjectsData, assignmentsData] = await Promise.all([
        classesRes.json(),
        subjectsRes.json(),
        assignmentsRes.json(),
      ]);

      if (classesData.status === "success")
        setClasses(classesData.data.classes.map((c) => c.className));
      if (subjectsData.status === "success")
        setSubjects(subjectsData.data.subjects.map((s) => s.name));
      if (assignmentsData.status === "success") {
        const assignments = {};
        Object.entries(assignmentsData.data.assignments).forEach(
          ([email, data]) => {
            assignments[email] = data.classes;
          }
        );
        setTeacherAssignments(assignments);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherClasses = async (email) => {
    if (!email || !email.includes("@")) return;

    setFetchingTeacherClasses(true);
    try {
      const response = await fetch(
        `/api/admin/teacher-classes/${encodeURIComponent(email)}`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();

      if (data.status === "success") {
        setTeacherAssignments((prev) => ({
          ...prev,
          [email.toLowerCase()]: data.data.classes || [],
        }));
      } else {
        setTeacherAssignments((prev) => ({
          ...prev,
          [email.toLowerCase()]: [],
        }));
      }
    } catch (error) {
      console.error("Error fetching teacher classes:", error);
      setTeacherAssignments((prev) => ({
        ...prev,
        [email.toLowerCase()]: [],
      }));
    } finally {
      setFetchingTeacherClasses(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (removeTeacher.email) {
        fetchTeacherClasses(removeTeacher.email);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [removeTeacher.email]);

  const handleAssignClass = async (e) => {
    e.preventDefault();
    setAssignClassLoading(true);
    try {
      const response = await fetch("/api/admin/assign-teacher-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: teacherClass.email,
          className: teacherClass.class,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setTeacherAssignments((prev) => {
          const lowerEmail = teacherClass.email.toLowerCase();
          const current = prev[lowerEmail] || [];
          return { ...prev, [lowerEmail]: [...current, teacherClass.class] };
        });
        setTeacherClass({ email: "", class: "" });
        alert("✅ Teacher assigned successfully!");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error assigning teacher");
    } finally {
      setAssignClassLoading(false);
    }
  };

  const handleRemoveClass = async (e) => {
    e.preventDefault();
    setRemoveClassLoading(true);
    try {
      const response = await fetch("/api/admin/remove-teacher-class", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: removeTeacher.email,
          className: removeTeacher.class,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setTeacherAssignments((prev) => {
          const lowerEmail = removeTeacher.email.toLowerCase();
          const current = prev[lowerEmail] || [];
          return {
            ...prev,
            [lowerEmail]: current.filter((c) => c !== removeTeacher.class),
          };
        });
        setRemoveTeacher({ email: "", class: "" });
        alert("✅ Teacher removed successfully!");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error removing teacher");
    } finally {
      setRemoveClassLoading(false);
    }
  };

  const handleAssignSubjects = async (e) => {
    e.preventDefault();
    setAssignSubjectLoading(true);
    try {
      const response = await fetch("/api/admin/assign-teacher-subject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: assignSubject.email,
          subjectName: assignSubject.subject,
        }),
      });

      const data = await response.json();
      if (data.status === "success") {
        setAssignSubject({ email: "", subject: "" });
        alert("✅ Subject assigned successfully!");
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error assigning subject");
    } finally {
      setAssignSubjectLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setCsvFile(file);

    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const rows = result.data;
          const seen = new Set();
          const dupes = [];

          rows.forEach((row, i) => {
            const email = row.email?.trim().toLowerCase();
            const key = `${email}-${row.class}-${row.subject}`;

            if (seen.has(key)) {
              dupes.push({ ...row, rowNumber: i + 2 });
            }
            seen.add(key);
          });

          setCsvPreview(rows);
          setDuplicates(dupes);
          setShowPreview(true);
        },
      });
    } else {
      setCsvPreview([]);
      setShowPreview(false);
    }
  };

  const handleUploadCSV = async (e) => {
    e.preventDefault();
    if (!csvFile || csvPreview.length === 0) {
      alert("Please select a CSV file.");
      return;
    }

    setCsvLoading(true);
    const seen = new Set();
    let successCount = 0;
    let errorCount = 0;

    for (const [i, row] of csvPreview.entries()) {
      const email = row.email?.trim().toLowerCase();
      const key = `${email}-${row.class}-${row.subject}`;

      if (seen.has(key)) continue;
      seen.add(key);

      try {
        if (row.class) {
          const classResponse = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/admin/assign-teacher-class`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, className: row.class }),
            }
          );
          const classData = await classResponse.json();

          if (!classResponse.ok) {
            console.log(classResponse);
          }
          if (classData.status === "success") successCount++;
          else errorCount++;
        }

        if (row.subject) {
          const subjectResponse = await fetch(
            "/api/admin/assign-teacher-subject",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ email, subjectName: row.subject }),
            }
          );
          const subjectData = await subjectResponse.json();
          if (subjectData.status === "success") successCount++;
          else errorCount++;
        }
      } catch (error) {
        console.error(error);
        errorCount++;
      }
    }

    setCsvData(csvPreview);
    alert(`✅ CSV processed! Success: ${successCount}, Errors: ${errorCount}`);

    setCsvFile(null);
    setCsvPreview([]);
    setShowPreview(false);
    fetchData();
    setCsvLoading(false);
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
          <button
            type="submit"
            className="btn btn-green"
            disabled={assignSubjectLoading}
          >
            {assignSubjectLoading ? "Assigning..." : "Assign"}
          </button>
        </form>
      </div>

      {/* 2️⃣ Assign Teacher to Class */}
      <div className="card_t">
        <h2>👩🏫 Assign Teacher to a Class</h2>
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
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="btn btn-green"
            disabled={assignClassLoading}
          >
            {assignClassLoading ? "Assigning..." : "Assign"}
          </button>
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
              setRemoveTeacher({ email: e.target.value, class: "" })
            }
            required
          />
          <select
            value={removeTeacher.class}
            onChange={(e) =>
              setRemoveTeacher({ ...removeTeacher, class: e.target.value })
            }
            required
            disabled={!removeTeacher.email || fetchingTeacherClasses}
          >
            <option value="">
              {!removeTeacher.email
                ? "Enter teacher email first"
                : fetchingTeacherClasses
                ? "Loading classes..."
                : teacherAssignments[removeTeacher.email?.toLowerCase()]
                    ?.length > 0
                ? "Select Class"
                : "No classes assigned"}
            </option>
            {removeTeacher.email &&
              !fetchingTeacherClasses &&
              (teacherAssignments[removeTeacher.email.toLowerCase()] || []).map(
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
            disabled={removeClassLoading}
          >
            {removeClassLoading ? "Removing..." : "Remove"}
          </button>
        </form>
      </div>

      {/* 4️⃣ Upload CSV */}
      <div className="card_t">
        <h2>📂 Assign Teachers to Classes (CSV)</h2>
        <form onSubmit={handleUploadCSV} className="form">
          <input type="file" accept=".csv" onChange={handleFileSelect} />
          {showPreview && (
            <button
              type="submit"
              className="btn btn-green"
              disabled={csvLoading}
            >
              {csvLoading ? "Processing..." : "Confirm Upload"}
            </button>
          )}
        </form>

        {/* CSV Preview Before Upload */}
        {showPreview && csvPreview.length > 0 && (
          <div className="csv-preview">
            <h3>📋 Preview Data (Review before upload)</h3>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Subject</th>
                </tr>
              </thead>
              <tbody>
                {csvPreview.map((row, idx) => (
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

        {/* CSV Results After Upload */}
        {csvData.length > 0 && !showPreview && (
          <div className="csv-preview">
            <h3>📋 Processed Data</h3>
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
                  <tr key={idx}>
                    <td>{row.email}</td>
                    <td>{row.class}</td>
                    <td>{row.subject}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTeachers;
