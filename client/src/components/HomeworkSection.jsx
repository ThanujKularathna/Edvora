import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/authContext";
import EnhancedHomeworkModal from "./modals/EnhancedHomeworkModal";
// import { API_BASE_URL } from "../config";
import "./HomeworkSection.css";
import "../styles/Modal.css";

const HomeworkSection = ({ className, showModal, setShowModal }) => {
  const { user } = useAuth();
  const [homeworks, setHomeworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    id: null,
  });

  // Fetch homeworks when component mounts
  useEffect(() => {
    fetchHomeworks();
  }, [className]);

  const fetchHomeworks = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch(`/api/v1/assignments?class=${className}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch homeworks: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.data) {
        setHomeworks(data.data);
      }
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      setError("Failed to load homeworks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHomework = (homework) => {
    setHomeworks([homework, ...homeworks]);
  };

  // Show delete confirmation dialog
  const showDeleteConfirmation = (id) => {
    setDeleteConfirmation({ show: true, id: id });
  };

  // Handle actual homework deletion
  const handleDeleteHomework = async (id) => {
    try {
      const response = await fetch(`/api/v1/assignments/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete homework");
      }

      // Remove from state
      setHomeworks(homeworks.filter((hw) => hw.id !== id));
    } catch (error) {
      console.error("Error deleting homework:", error);
      alert(`Failed to delete homework: ${error.message}`);
    } finally {
      setDeleteConfirmation({ show: false, id: null });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "No deadline";
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
        <h3>Home Works</h3>
        {/* Button removed as it's now in the top toolbar */}
      </div>

      <div className="section-body">
        {isLoading ? (
          <p>Loading homeworks...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : homeworks.length === 0 ? (
          <p>No homeworks available for this class.</p>
        ) : (
          homeworks.map((hw) => (
            <div key={hw.id} className="card homework-card">
              <div className="homework-info">
                <span className="homework-title">{hw.title}</span>
                <div className="homework-details">
                  {hw.subject && (
                    <span className="homework-subject">
                      Subject: {hw.subject}
                    </span>
                  )}
                  {hw.deadline && (
                    <span className="homework-deadline">
                      Due: {formatDate(hw.deadline)}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-buttons">
                <button
                  className="delete-btn"
                  onClick={() => showDeleteConfirmation(hw.id)}
                >
                  Delete
                </button>
                <button
                  className="delete-btn"
                  onClick={() => {
                    window.open(
                      `${
                        process.env.REACT_APP_API_BASE_URL
                      }/api/v1/assignments/download/${encodeURIComponent(
                        hw.fileName
                      )}`,
                      "_blank"
                    );
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <EnhancedHomeworkModal
          onClose={() => setShowModal(false)}
          onUpload={handleAddHomework}
          className={className}
          teacherSubjects={
            user?.subjects || ["Mathematics", "Science", "English"]
          }
          teacherId={user?._id || user?.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.show && (
        <div className="modal-overlay">
          <div className="confirmation-dialog">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this homework?</p>
            <div className="confirmation-buttons">
              <button
                onClick={() => handleDeleteHomework(deleteConfirmation.id)}
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

export default HomeworkSection;
