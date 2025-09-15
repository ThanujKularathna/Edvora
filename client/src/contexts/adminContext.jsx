import { createContext, useContext, useState } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // ✅ Shared users across admin panel
  const [users, setUsers] = useState([
    { id: 1000, name: "User 1", email: "user1@example.com", role: "admin", status: "Active" },
    { id: 1001, name: "User 2", email: "user2@example.com", role: "teacher", status: "Active" },
    { id: 1002, name: "User 3", email: "user3@example.com", role: "teacher", status: "Active" },
    { id: 1003, name: "User 4", email: "user4@example.com", role: "student", status: "Active" },
  ]);

  // ✅ Shared classes
  const [classes, setClasses] = useState(["6-A", "6-B", "7-A"]);

  // ✅ Shared subjects
  const [subjects, setSubjects] = useState(["Mathematics", "Science", "English"]);

  // ✅ Teacher → assigned classes
  const [teacherAssignments, setTeacherAssignments] = useState({}); // { email: ["6-A", "7-A"] }

  // ✅ Teacher → assigned subjects
  const [teacherSubjects, setTeacherSubjects] = useState({}); // { email: ["Math", "Science"] }

  // ✅ Student → assigned classes
  const [studentAssignments, setStudentAssignments] = useState({}); // { email: ["6-A", "7-A"] }

  // ✅ Activity log
  const [logs, setLogs] = useState([
    { time: "09:00 AM", user: "System", action: "System initialized" }
  ]);

  // Helper: Add activity log
  const addActivity = (user, action) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [{ time, user, action }, ...prev]);
  };

  // ---------- Student actions ----------
  const assignStudentToClass = (email, className) => {
    setStudentAssignments((prev) => {
      const lowerEmail = email.toLowerCase();
      const current = prev[lowerEmail] || [];
      if (!current.includes(className)) {
        addActivity("Admin", `Assigned student ${email} to ${className}`);
        return { ...prev, [lowerEmail]: [...current, className] };
      }
      return prev;
    });
  };

  const removeStudentFromClass = (email, className) => {
    setStudentAssignments((prev) => {
      const lowerEmail = email.toLowerCase();
      const current = prev[lowerEmail] || [];
      addActivity("Admin", `Removed student ${email} from ${className}`);
      return { ...prev, [lowerEmail]: current.filter((c) => c !== className) };
    });
  };

  // ---------- Teacher actions ----------
  const assignTeacherToClass = (email, className) => {
    setTeacherAssignments((prev) => {
      const lowerEmail = email.toLowerCase();
      const current = prev[lowerEmail] || [];
      if (!current.includes(className)) {
        addActivity("Admin", `Assigned teacher ${email} to ${className}`);
        return { ...prev, [lowerEmail]: [...current, className] };
      }
      return prev;
    });
  };

  const removeTeacherFromClass = (email, className) => {
    setTeacherAssignments((prev) => {
      const lowerEmail = email.toLowerCase();
      const current = prev[lowerEmail] || [];
      addActivity("Admin", `Removed teacher ${email} from ${className}`);
      return { ...prev, [lowerEmail]: current.filter((c) => c !== className) };
    });
  };

  const assignSubjectToTeacher = (email, subject) => {
    setTeacherSubjects((prev) => {
      const lowerEmail = email.toLowerCase();
      const current = prev[lowerEmail] || [];
      if (!current.includes(subject)) {
        addActivity("Admin", `Assigned subject ${subject} to teacher ${email}`);
        return { ...prev, [lowerEmail]: [...current, subject] };
      }
      return prev;
    });
  };

  const removeSubjectFromTeacher = (email, subject) => {
    setTeacherSubjects((prev) => {
      const lowerEmail = email.toLowerCase();
      const current = prev[lowerEmail] || [];
      addActivity("Admin", `Removed subject ${subject} from teacher ${email}`);
      return { ...prev, [lowerEmail]: current.filter((s) => s !== subject) };
    });
  };

  // ---------- Classes actions ----------
  const createClass = (className) => {
    setClasses((prev) => {
      if (!prev.includes(className)) {
        addActivity("Admin", `Created new class ${className}`);
        return [...prev, className];
      }
      return prev;
    });
  };

  // ---------- Subjects actions ----------
  const createSubject = (subjectName) => {
    setSubjects((prev) => {
      if (!prev.includes(subjectName)) {
        addActivity("Admin", `Created new subject ${subjectName}`);
        return [...prev, subjectName];
      }
      return prev;
    });
  };

  const removeSubject = (subjectName) => {
    setSubjects((prev) => {
      if (prev.includes(subjectName)) {
        addActivity("Admin", `Removed subject ${subjectName}`);
        return prev.filter((s) => s !== subjectName);
      }
      return prev;
    });

    // Also remove subject from teachers who had it
    setTeacherSubjects((prev) => {
      const updated = {};
      for (const [email, subs] of Object.entries(prev)) {
        updated[email] = subs.filter((s) => s !== subjectName);
      }
      return updated;
    });
  };

  // ---------- Users actions ----------
  const addUser = (user) => {
    setUsers((prev) => [...prev, user]);
    addActivity("Admin", `Created new ${user.role}: ${user.email}`);
  };


  





  const value = { 
    users, setUsers, addUser,
    classes, setClasses, createClass,
    subjects, setSubjects, createSubject, removeSubject,
    teacherAssignments, setTeacherAssignments,
    teacherSubjects, setTeacherSubjects,
    studentAssignments, setStudentAssignments,
    assignStudentToClass, removeStudentFromClass,
    assignTeacherToClass, removeTeacherFromClass,
    assignSubjectToTeacher, removeSubjectFromTeacher,
    logs, addActivity
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside AdminProvider");
  return ctx;
}
