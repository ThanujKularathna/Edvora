import { createContext, useContext, useState } from "react";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacherAssignments, setTeacherAssignments] = useState({});
  const [teacherSubjects, setTeacherSubjects] = useState({});
  const [studentAssignments, setStudentAssignments] = useState({});
  const [logs, setLogs] = useState([]);

  const addActivity = (user, action) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setLogs((prev) => [{ time, user, action }, ...prev]);
  };

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

  const createClass = (className) => {
    setClasses((prev) => {
      if (!prev.includes(className)) {
        addActivity("Admin", `Created new class ${className}`);
        return [...prev, className];
      }
      return prev;
    });
  };

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

    setTeacherSubjects((prev) => {
      const updated = {};
      for (const [email, subs] of Object.entries(prev)) {
        updated[email] = subs.filter((s) => s !== subjectName);
      }
      return updated;
    });
  };

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
