import React, { useState, useEffect } from "react";
import { capitalCase } from "change-case";
import UploadLessonMaterialModal from "./modals/UploadLessonMaterialModal";
import "./HomeworkSection.css";

const LessonMaterialsSection = ({
  user,
  showUploadButton = true,
  openDropdown,
  setOpenDropdown,
  showModal,
  setShowModal,
  className,
  teacherSubjects,
}) => {
  const [materials, setMaterials] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    id: null,
  });

  useEffect(() => {
    fetchMaterials();
  }, [className]);

  const fetchMaterials = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (className) {
        queryParams.append('class', className);
      }
      
      const queryString = queryParams.toString();
      const url = queryString ? `/api/v1/lesson-materials?${queryString}` : '/api/v1/lesson-materials';

      const response = await fetch(url, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch lesson materials: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.data) {
        const materialsWithUrls = data.data.map((material) => ({
          ...material,
          downloadUrl: `http://localhost:8000/api/v1/lesson-materials/download/${material.fileName}`,
        }));
        setMaterials(materialsWithUrls);
      }
    } catch (error) {
      console.error("Error fetching lesson materials:", error);
      setError("Failed to load lesson materials");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = (material) => {
    const formattedMaterial = {
      ...material,
      id: material.id || material._id,
      downloadUrl: `http://localhost:8000/api/v1/lesson-materials/download/${material.fileName}`,
    };
    setMaterials([formattedMaterial, ...materials]);
  };

  const showDeleteConfirmation = (id) => {
    setDeleteConfirmation({ show: true, id: id });
  };

  const handleDeleteMaterial = async (id) => {
    try {
      const response = await fetch(`/api/v1/lesson-materials/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete lesson material");
      }

      setMaterials(materials.filter((material) => material.id !== id));
    } catch (error) {
      console.error("Error deleting lesson material:", error);
      alert(`Failed to delete lesson material: ${error.message}`);
    } finally {
      setDeleteConfirmation({ show: false, id: null });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="content-section">
      <div className="section-header">
        <h3>Lesson Materials</h3>
      </div>

      <div className="section-body">
        {isLoading ? (
          <p>Loading lesson materials...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : materials.length === 0 ? (
          <p>No lesson materials available for this class.</p>
        ) : (
          materials.map((material) => (
            <div key={material.id} className="tool-card homework-card">
              <div className="homework-info">
                <span className="homework-title">{material.title}</span>
                <div className="homework-details">
                  {material.subject && (
                    <span className="homework-subject">
                      Subject:{" "}
                      {capitalCase(material.subject.name || material.subject)}
                    </span>
                  )}
                  <span className="homework-deadline">
                    Uploaded: {formatDate(material.createdAt)}
                  </span>
                  {material.description && (
                    <span className="homework-description">
                      {material.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="quiz-dropdown-container">
                <button
                  className="quiz-dropdown-btn"
                  onClick={() =>
                    setOpenDropdown &&
                    setOpenDropdown(
                      openDropdown === `material-${material.id}`
                        ? null
                        : `material-${material.id}`
                    )
                  }
                >
                  Options ▼
                </button>
                {openDropdown === `material-${material.id}` && (
                  <div className="quiz-dropdown-menu">
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        window.open(material.downloadUrl, "_blank");
                        setOpenDropdown && setOpenDropdown(null);
                      }}
                    >
                      View
                    </button>
                    {user?.role === "teacher" && (
                      <button
                        className="dropdown-item delete-item"
                        onClick={() => {
                          showDeleteConfirmation(material.id);
                          setOpenDropdown && setOpenDropdown(null);
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <UploadLessonMaterialModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleAddMaterial}
          className={className}
          teacherSubjects={teacherSubjects}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.show && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this lesson material?</p>
            <div className="confirmation-buttons">
              <button
                onClick={() => handleDeleteMaterial(deleteConfirmation.id)}
                className="confirm-btn"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirmation({ show: false, id: null })}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonMaterialsSection;
