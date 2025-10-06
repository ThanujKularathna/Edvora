// pages/admin/ManageSubjects.jsx
import React, { useState, useEffect } from "react";
import "./ManageSubjects.css";

function ManageSubjects() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/v1/subjects', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/v1/class', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Classes response:', data);
        setClasses(data.data.classes || data.data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const assignSubjectToClass = async (classId, subjectId) => {
    try {
      const response = await fetch(`/api/v1/class/${classId}/assign-subject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ subjectId })
      });
      
      if (response.ok) {
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error assigning subject:', error);
      return { success: false, message: 'Failed to assign subject' };
    }
  };

  const createSubject = async (subjectName) => {
    try {
      const response = await fetch('/api/v1/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name: subjectName })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubjects(prev => [...prev, data.data.subject]);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error creating subject:', error);
      return { success: false, message: 'Failed to create subject' };
    }
  };

  const removeSubject = async (subjectId) => {
    try {
      const response = await fetch(`/api/v1/subjects/${subjectId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setSubjects(prev => prev.filter(s => s._id !== subjectId));
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, message: error.message };
      }
    } catch (error) {
      console.error('Error removing subject:', error);
      return { success: false, message: 'Failed to remove subject' };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchSubjects(), fetchClasses()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Assign subject to class
  const handleAssignSubject = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) return;
    
    setLoading(true);
    setError("");
    
    const result = await assignSubjectToClass(selectedClass, selectedSubject);
    
    if (result.success) {
      setSelectedClass("");
      setSelectedSubject("");
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  // Create
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    
    setLoading(true);
    setError("");
    
    const result = await createSubject(newSubject.trim());
    
    if (result.success) {
      setNewSubject("");
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  // Remove
  const handleRemoveSubject = async (subjectId) => {
    setLoading(true);
    setError("");
    
    const result = await removeSubject(subjectId);
    
    if (result.success) {
      setConfirmDelete(null);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  if (loading && subjects.length === 0) {
    return <div className="loading">Loading subjects...</div>;
  }

  return (
    <div className="manage-subjects">
      {error && <div className="error-message">{error}</div>}
      
      {/* Create Subject */}
      <div className="card_s">
        <h2>➕ Create Subject</h2>
        <form onSubmit={handleCreateSubject} className="form">
          <input
            type="text"
            placeholder="Subject Name"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            disabled={loading}
            required
          />
          <button type="submit" className="btn btn-green" disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </button>
        </form>
      </div>

      {/* Assign Subject to Class */}
      <div className="card_s">
        <h2>🎯 Assign Subject to Class</h2>
        <form onSubmit={handleAssignSubject} className="form">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select Class</option>
            {classes && classes.map((c) => (
              <option key={c._id} value={c._id}>{c.className}</option>
            ))}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Select Subject</option>
            {subjects && subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-blue" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </form>
      </div>

      {/* Current Subjects with Remove Options */}
      <div className="card_s">
        <h2>📋 Current Subjects</h2>
        <div className="subjects-list">
          {subjects && subjects.map((s) => (
            <div key={s._id} className="subject-item">
              <div className="subject-info">
                <span className="subject-name">{s.name}</span>
                <span className="subject-id">ID: {s._id}</span>
              </div>
              <button 
                className="btn btn-red btn-small"
                onClick={() => setConfirmDelete(s)}
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to remove the subject:</p>
            <p><strong>{confirmDelete.name}</strong></p>
            <p>ID: {confirmDelete._id}</p>
            <div className="modal-buttons">
              <button 
                className="btn btn-red"
                onClick={() => handleRemoveSubject(confirmDelete._id)}
                disabled={loading}
              >
                {loading ? 'Removing...' : 'Yes, Remove'}
              </button>
              <button 
                className="btn btn-gray"
                onClick={() => setConfirmDelete(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSubjects;
