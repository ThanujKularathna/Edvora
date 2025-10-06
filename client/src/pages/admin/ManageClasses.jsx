import React, { useState, useEffect } from "react";
import "./ManageClasses.css";

function ManageClasses() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [newClass, setNewClass] = useState({ grade: "", section: "" });
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/admin/classes', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/admin/subjects', {
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

  const handleCreateClass = async (e) => {
    e.preventDefault();
    const className = `${newClass.grade}-${newClass.section.toUpperCase()}`;
    
    try {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          className,
          subjects: selectedSubjects
        })
      });

      if (response.ok) {
        alert('Class created successfully!');
        setNewClass({ grade: "", section: "" });
        setSelectedSubjects([]);
        fetchClasses();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create class');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Failed to create class');
    }
  };

  const handleDeleteClass = async (classId, className) => {
    if (window.confirm(`Are you sure you want to delete class ${className}? This will remove all teachers and students from this class.`)) {
      try {
        const response = await fetch(`/api/admin/classes/${classId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          alert('Class deleted successfully!');
          fetchClasses();
        } else {
          const error = await response.json();
          alert(error.message || 'Failed to delete class');
        }
      } catch (error) {
        console.error('Error deleting class:', error);
        alert('Failed to delete class');
      }
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  if (loading) {
    return <div className="loading">Loading classes...</div>;
  }

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
          <select
            value={newClass.section}
            onChange={(e) => setNewClass({ ...newClass, section: e.target.value })}
            required
          >
            <option value="">Select Section</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
          
          <div className="subjects-selection">
            <h4>Select Subjects:</h4>
            <div className="subjects-grid">
              {subjects.map((subject) => (
                <label key={subject._id} className="subject-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject._id)}
                    onChange={() => handleSubjectToggle(subject._id)}
                  />
                  {subject.name}
                </label>
              ))}
            </div>
          </div>
          
          <button type="submit" className="btn btn-green">Create Class</button>
        </form>
      </div>

      {/* Current Classes */}
      <div className="card_c">
        <h2>📚 Current Classes</h2>
        {classes.length === 0 ? (
          <p>No classes created yet.</p>
        ) : (
          <div className="classes-list">
            {classes.map((classItem) => (
              <div key={classItem._id} className="class-item">
                <div className="class-info">
                  <h3>{classItem.className}</h3>
                  <p><strong>Teachers:</strong> {classItem.teachers?.length || 0}</p>
                  <p><strong>Students:</strong> {classItem.students?.length || 0}</p>
                  <p><strong>Subjects:</strong> {classItem.subjects?.map(s => s.name).join(', ') || 'None'}</p>
                </div>
                <button
                  className="btn btn-red"
                  onClick={() => handleDeleteClass(classItem._id, classItem.className)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageClasses;
