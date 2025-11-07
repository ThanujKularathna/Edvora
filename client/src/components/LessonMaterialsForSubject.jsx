import React, { useState, useEffect } from "react";

const LessonMaterialsForSubject = ({ subjectName, user }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);

        const studentClass = user?.classes?.className || user?.classes;
        if (!studentClass) {
          setMaterials([]);
          return;
        }

        // Use the same endpoint pattern as homeworks
        const API_BASE_URL =
          process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";
        const response = await fetch(
          `${API_BASE_URL}/api/v1/student/subject/${subjectName}/class/${studentClass}`,
          { credentials: "include" }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          console.log('Lesson Materials:', data.data?.lessonMaterials);
          setMaterials(data.data?.lessonMaterials || []);
        } else {
          console.error('API Error:', response.status);
        }
      } catch (error) {
        console.error("Error fetching lesson materials:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && subjectName) {
      fetchMaterials();
    }
  }, [subjectName, user]);

  if (loading) {
    return <p>Loading lesson materials...</p>;
  }

  if (materials.length === 0) {
    return <p>No lesson materials available for this subject</p>;
  }

  return (
    <div>
      {materials.map((material) => (
        <div key={material.id} className="assignment-card">
          <div>
            <h4>
              {material.teacher?.name || "Unknown Teacher"} | {material.title}
            </h4>
            {material.description && <p>{material.description}</p>}
            <p>Uploaded: {new Date(material.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="homework-dropdown-container">
            <button
              className="homework-dropdown-btn"
              onClick={() => {
                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
                window.open(`${API_BASE_URL}${material.downloadUrl}`, "_blank");
              }}
            >
              Download
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LessonMaterialsForSubject;
